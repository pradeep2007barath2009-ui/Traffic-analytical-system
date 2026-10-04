"""
UrbanFlow AI - Adaptive Signal Controller & Green Corridor Engine
Implements dynamic queue-responsive phase timing and emergency vehicle preemption.
"""

import time
from typing import Dict, Any, Optional

class SignalPhase:
    NORTH_SOUTH_GREEN = "NS_GREEN"
    NORTH_SOUTH_YELLOW = "NS_YELLOW"
    EAST_WEST_GREEN = "EW_GREEN"
    EAST_WEST_YELLOW = "EW_YELLOW"

class AdaptiveSignalController:
    def __init__(self):
        # Operational mode: 'ADAPTIVE' or 'FIXED'
        self.mode = "ADAPTIVE"
        
        # State tracking
        self.current_phase = SignalPhase.NORTH_SOUTH_GREEN
        self.phase_start_time = time.time()
        self.phase_duration = 25.0 # dynamically computed or fixed
        self.yellow_duration = 3.5
        
        # Fixed timing baseline configuration
        self.fixed_green_time = 30.0

        # Adaptive bounds
        self.min_green_time = 10.0
        self.max_green_time = 50.0

        # Green Corridor (Emergency Preemption)
        self.green_corridor_active = False
        self.corridor_direction = None # 'NS' or 'EW'
        self.preemption_start_time = 0.0
        self.preemption_reason = ""
        self.emergency_vehicles_cleared = 0
        self.total_time_saved_sec = 0.0

        # Queue tracking
        self.queue_ns = 5
        self.queue_ew = 4

    def set_mode(self, mode: str):
        if mode in ["ADAPTIVE", "FIXED"]:
            self.mode = mode

    def update_queues(self, queue_ns: int, queue_ew: int):
        self.queue_ns = max(0, queue_ns)
        self.queue_ew = max(0, queue_ew)

    def trigger_emergency_preemption(self, direction: str = "NS", reason: str = "Ambulance Detected"):
        """Activates emergency green corridor for priority clearance"""
        self.green_corridor_active = True
        self.corridor_direction = direction
        self.preemption_start_time = time.time()
        self.preemption_reason = reason

        # If currently opposing direction is green, trigger immediate yellow clearance
        if direction == "NS":
            if self.current_phase == SignalPhase.EAST_WEST_GREEN:
                self.current_phase = SignalPhase.EAST_WEST_YELLOW
                self.phase_start_time = time.time()
                self.phase_duration = 2.0 # Quick yellow transition
            elif self.current_phase != SignalPhase.EAST_WEST_YELLOW:
                self.current_phase = SignalPhase.NORTH_SOUTH_GREEN
                self.phase_duration = 999.0 # Lock green
        else: # EW
            if self.current_phase == SignalPhase.NORTH_SOUTH_GREEN:
                self.current_phase = SignalPhase.NORTH_SOUTH_YELLOW
                self.phase_start_time = time.time()
                self.phase_duration = 2.0
            elif self.current_phase != SignalPhase.NORTH_SOUTH_YELLOW:
                self.current_phase = SignalPhase.EAST_WEST_GREEN
                self.phase_duration = 999.0

    def clear_emergency_preemption(self):
        """Called when emergency vehicle passes through"""
        if self.green_corridor_active:
            self.green_corridor_active = False
            self.emergency_vehicles_cleared += 1
            elapsed = time.time() - self.preemption_start_time
            # Estimated normal wait avoided
            saved = max(15.0, 45.0 - elapsed)
            self.total_time_saved_sec += saved
            self.corridor_direction = None
            # Return to normal cycle
            self.phase_start_time = time.time()
            self.phase_duration = self._compute_target_duration()

    def _compute_target_duration(self) -> float:
        if self.mode == "FIXED":
            return self.fixed_green_time

        # Adaptive Queue Weighting
        if self.current_phase in [SignalPhase.NORTH_SOUTH_GREEN, SignalPhase.NORTH_SOUTH_YELLOW]:
            my_queue = self.queue_ns
            other_queue = self.queue_ew
        else:
            my_queue = self.queue_ew
            other_queue = self.queue_ns

        # Dynamic formula based on queue ratio
        total_queue = max(1, my_queue + other_queue)
        ratio = my_queue / total_queue
        dynamic_time = self.min_green_time + (ratio * (self.max_green_time - self.min_green_time))
        return round(max(self.min_green_time, min(self.max_green_time, dynamic_time)), 1)

    def tick(self) -> Dict[str, Any]:
        """Calculates current signal state and advances phases"""
        now = time.time()
        elapsed = now - self.phase_start_time

        # If Green Corridor is active and corridor is green, hold it
        if self.green_corridor_active:
            if self.corridor_direction == "NS" and self.current_phase == SignalPhase.EAST_WEST_YELLOW:
                if elapsed >= self.phase_duration:
                    self.current_phase = SignalPhase.NORTH_SOUTH_GREEN
                    self.phase_start_time = now
                    self.phase_duration = 999.0
            elif self.corridor_direction == "EW" and self.current_phase == SignalPhase.NORTH_SOUTH_YELLOW:
                if elapsed >= self.phase_duration:
                    self.current_phase = SignalPhase.EAST_WEST_GREEN
                    self.phase_start_time = now
                    self.phase_duration = 999.0
            
            # If held for more than 20 seconds, auto-clear preemption
            if elapsed > 20.0 and self.phase_duration == 999.0:
                self.clear_emergency_preemption()

        # Regular Phase Cycle Transitions
        elif elapsed >= self.phase_duration:
            if self.current_phase == SignalPhase.NORTH_SOUTH_GREEN:
                self.current_phase = SignalPhase.NORTH_SOUTH_YELLOW
                self.phase_start_time = now
                self.phase_duration = self.yellow_duration

            elif self.current_phase == SignalPhase.NORTH_SOUTH_YELLOW:
                self.current_phase = SignalPhase.EAST_WEST_GREEN
                self.phase_start_time = now
                self.phase_duration = self._compute_target_duration()

            elif self.current_phase == SignalPhase.EAST_WEST_GREEN:
                self.current_phase = SignalPhase.EAST_WEST_YELLOW
                self.phase_start_time = now
                self.phase_duration = self.yellow_duration

            elif self.current_phase == SignalPhase.EAST_WEST_YELLOW:
                self.current_phase = SignalPhase.NORTH_SOUTH_GREEN
                self.phase_start_time = now
                self.phase_duration = self._compute_target_duration()

        # Calculate time remaining
        remaining = max(0.0, self.phase_duration - (now - self.phase_start_time))
        if self.phase_duration >= 900.0:
            remaining = 0.0

        # Build signal states per direction
        ns_light = "GREEN" if self.current_phase == SignalPhase.NORTH_SOUTH_GREEN else (
            "YELLOW" if self.current_phase == SignalPhase.NORTH_SOUTH_YELLOW else "RED"
        )
        ew_light = "GREEN" if self.current_phase == SignalPhase.EAST_WEST_GREEN else (
            "YELLOW" if self.current_phase == SignalPhase.EAST_WEST_YELLOW else "RED"
        )

        return {
            "mode": self.mode,
            "current_phase": self.current_phase,
            "ns_light": ns_light,
            "ew_light": ew_light,
            "phase_duration": self.phase_duration,
            "time_remaining_sec": round(remaining, 1),
            "green_corridor": {
                "active": self.green_corridor_active,
                "direction": self.corridor_direction,
                "reason": self.preemption_reason,
                "cleared_count": self.emergency_vehicles_cleared,
                "time_saved_sec": round(self.total_time_saved_sec, 1)
            },
            "queues": {
                "north_south": self.queue_ns,
                "east_west": self.queue_ew
            }
        }
