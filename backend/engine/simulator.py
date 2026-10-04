"""
UrbanFlow AI - Multi-Junction Microscopic Traffic Simulator
Models vehicle flow across North, South, East, and West approaches for all 8 municipal camera intersections,
interfacing directly with the Adaptive Signal Controller and Computer Vision Engine.
Includes pedestrian crosswalk actuation, safety holding, and yield checking.
"""

import time
import math
import random
from typing import List, Dict, Any, Optional
from backend.engine.adaptive_signal import AdaptiveSignalController

JUNCTION_CONFIGS = {
    "CAM-01": {
        "id": "CAM-01",
        "label": "Highway 101 Inflow",
        "area": "North Expressway",
        "speed_limit": 70.0,
        "topology": "EXPRESSWAY",
        "approaches": {
            "N": "Expressway Inflow North",
            "S": "Highway 101 Bypass South",
            "E": "Service Connector East",
            "W": "Outer Ring Road West"
        },
        "density_factor": 1.25,
        "special_feature": "HIGHWAY_CORRIDOR"
    },
    "CAM-02": {
        "id": "CAM-02",
        "label": "Express Toll Plaza",
        "area": "North Expressway",
        "speed_limit": 60.0,
        "topology": "TOLL_PLAZA",
        "approaches": {
            "N": "Toll Gantry North",
            "S": "Toll Plaza South",
            "E": "Fastag Feeder East",
            "W": "Weigh Lane West"
        },
        "density_factor": 1.1,
        "special_feature": "TOLL_BOOTH"
    },
    "CAM-03": {
        "id": "CAM-03",
        "label": "Central 4-Way Junction",
        "area": "Downtown Commercial",
        "speed_limit": 50.0,
        "topology": "URBAN_GRID",
        "approaches": {
            "N": "Broadway Blvd North",
            "S": "Market St South",
            "E": "5th Ave East",
            "W": "Commerce Way West"
        },
        "density_factor": 1.0,
        "special_feature": "COMMERCIAL_DOWNTOWN"
    },
    "CAM-04": {
        "id": "CAM-04",
        "label": "Main Ave Transit Hub",
        "area": "Downtown Commercial",
        "speed_limit": 40.0,
        "topology": "TRANSIT_HUB",
        "approaches": {
            "N": "Metro Busway North",
            "S": "Central Terminal South",
            "E": "Tram Route East",
            "W": "City Corridor West"
        },
        "density_factor": 0.95,
        "special_feature": "BUS_PRIORITY_LANE"
    },
    "CAM-05": {
        "id": "CAM-05",
        "label": "East Boulevard Inflow",
        "area": "Tech Park Corridor",
        "speed_limit": 60.0,
        "topology": "TECH_CORRIDOR",
        "approaches": {
            "N": "Innovation Way North",
            "S": "Silicon Pkwy South",
            "E": "Campus Bypass East",
            "W": "Research Ring West"
        },
        "density_factor": 1.05,
        "special_feature": "SMART_CAMPUS"
    },
    "CAM-06": {
        "id": "CAM-06",
        "label": "West Metro Interchange",
        "area": "Tech Park Corridor",
        "speed_limit": 45.0,
        "topology": "INTERCHANGE",
        "approaches": {
            "N": "Overpass Inflow North",
            "S": "Underpass Outflow South",
            "E": "Metro Link East",
            "W": "Station Access West"
        },
        "density_factor": 1.1,
        "special_feature": "MULTIMODAL_INTERCHANGE"
    },
    "CAM-07": {
        "id": "CAM-07",
        "label": "Trauma Center Emergency Gate",
        "area": "Hospital Green Route",
        "speed_limit": 50.0,
        "topology": "EMERGENCY_ROUTE",
        "approaches": {
            "N": "Ambulance Bay North",
            "S": "Emergency Clinic South",
            "E": "Helipad Corridor East",
            "W": "Triage Access West"
        },
        "density_factor": 0.8,
        "special_feature": "EMERGENCY_PRIORITY_ZONE"
    },
    "CAM-08": {
        "id": "CAM-08",
        "label": "Green Route Clearance Sensor",
        "area": "Hospital Green Route",
        "speed_limit": 50.0,
        "topology": "EMERGENCY_CLEARANCE",
        "approaches": {
            "N": "Hospital Expwy North",
            "S": "Rapid Transit South",
            "E": "Trauma Link East",
            "W": "Perimeter Loop West"
        },
        "density_factor": 0.85,
        "special_feature": "CLEARANCE_CORRIDOR"
    }
}

class SimPedestrian:
    def __init__(self, p_id: int, approach: str = "N"):
        self.id = p_id
        self.approach = approach  # Crosswalk on 'N', 'S', 'E', or 'W' approach
        self.progress = 0.0       # 0.0 (curb) to 1.0 (opposite curb)
        self.speed = 0.14         # Rate of progress per second (~7 seconds to cross)
        self.cleared = False

    def update(self, dt: float):
        self.progress += self.speed * dt
        if self.progress >= 1.0:
            self.cleared = True

class SimVehicle:
    def __init__(self, v_id: int, approach: str, v_type: str, is_emergency: bool = False, speed_limit: float = 50.0):
        self.id = v_id
        self.approach = approach  # 'N', 'S', 'E', 'W'
        self.type = v_type
        self.is_emergency = is_emergency
        self.dist = 160.0
        base_speed = speed_limit * 0.82
        self.speed = base_speed if not is_emergency else (speed_limit * 1.18)
        self.target_speed = self.speed
        self.waiting_time = 0.0
        self.stopped = False
        self.cleared = False

    def update(self, dt: float, can_go: bool, leader_dist: Optional[float], pedestrian_crossing: bool = False):
        stop_line = 15.0

        should_stop = False
        if not self.is_emergency:
            # Red signal stop or pedestrian safety hold
            if (not can_go or pedestrian_crossing) and 15.0 <= self.dist <= 65.0:
                should_stop = True
            if leader_dist is not None and (self.dist - leader_dist) < 12.0:
                should_stop = True

        if should_stop:
            self.speed = 0.0
            self.stopped = True
            self.waiting_time += dt
            return
        else:
            self.stopped = False
            self.speed = min(self.target_speed, self.speed + 25.0 * dt)

        speed_mps = self.speed * (1000.0 / 3600.0)
        self.dist -= speed_mps * dt

        if self.dist < -60.0:
            self.cleared = True


class IntersectionSimulator:
    def __init__(self, cam_id: str = "CAM-03"):
        self.cam_id = cam_id
        self.config = JUNCTION_CONFIGS.get(cam_id, JUNCTION_CONFIGS["CAM-03"])
        self.signal_controller = AdaptiveSignalController()
        self.vehicles: List[SimVehicle] = []
        self.pedestrians: List[SimPedestrian] = []
        suffix = int(cam_id.split("-")[1]) if "-" in cam_id else 1
        self.next_id = 100 * suffix + 1
        self.next_ped_id = 500 * suffix + 1
        self.traffic_density = "MEDIUM"
        self.last_spawn_times = {'N': 0.0, 'S': 0.0, 'E': 0.0, 'W': 0.0}
        
        self.total_cleared = 0
        self.total_wait_time = 0.0
        self.co2_saved_kg = 0.0
        self.sim_start_time = time.time()
        self.last_tick_time = time.time()

    def set_density(self, density: str):
        if density in ["LOW", "MEDIUM", "RUSH_HOUR"]:
            self.traffic_density = density

    def set_controller_mode(self, mode: str):
        self.signal_controller.set_mode(mode)

    def inject_emergency_vehicle(self, approach: str = "N"):
        v = SimVehicle(
            v_id=self.next_id,
            approach=approach,
            v_type="ambulance",
            is_emergency=True,
            speed_limit=self.config["speed_limit"]
        )
        self.next_id += 1
        self.vehicles.append(v)
        
        direction = "NS" if approach in ['N', 'S'] else "EW"
        self.signal_controller.trigger_emergency_preemption(
            direction=direction,
            reason=f"Ambulance on {self.config['label']} ({approach})"
        )

    def trigger_pedestrian_crossing(self, approach: str = "N"):
        """Activates a pedestrian crossing on the specified approach crosswalk"""
        ped = SimPedestrian(p_id=self.next_ped_id, approach=approach)
        self.next_ped_id += 1
        self.pedestrians.append(ped)
        return ped

    def _get_spawn_rate(self) -> float:
        base = 2.0
        if self.traffic_density == "LOW":
            base = 3.6
        elif self.traffic_density == "RUSH_HOUR":
            base = 1.15
        factor = self.config.get("density_factor", 1.0)
        return max(0.8, base / factor)

    def _spawn_vehicles(self, now: float):
        interval = self._get_spawn_rate()
        for approach in ['N', 'S', 'E', 'W']:
            adj_interval = interval * 0.7 if (self.traffic_density == "RUSH_HOUR" and approach in ['N', 'S']) else interval
            if now - self.last_spawn_times[approach] > adj_interval:
                approach_vehicles = [v for v in self.vehicles if v.approach == approach]
                if not any(v.dist > 140.0 for v in approach_vehicles):
                    v_type = random.choices(["car", "motorcycle", "bus", "truck"], weights=[0.65, 0.20, 0.08, 0.07])[0]
                    v = SimVehicle(
                        v_id=self.next_id,
                        approach=approach,
                        v_type=v_type,
                        is_emergency=False,
                        speed_limit=self.config["speed_limit"]
                    )
                    self.next_id += 1
                    self.vehicles.append(v)
                    self.last_spawn_times[approach] = now + random.uniform(-0.3, 0.4)

    def tick(self) -> Dict[str, Any]:
        now = time.time()
        dt = min(0.1, max(0.01, now - self.last_tick_time))
        self.last_tick_time = now

        self._spawn_vehicles(now)

        # Update pedestrians
        for ped in self.pedestrians:
            ped.update(dt)
        self.pedestrians = [p for p in self.pedestrians if not p.cleared]

        # Queue tracking
        queue_ns = sum(1 for v in self.vehicles if v.approach in ['N', 'S'] and v.stopped and v.dist > 10.0)
        queue_ew = sum(1 for v in self.vehicles if v.approach in ['E', 'W'] and v.stopped and v.dist > 10.0)
        self.signal_controller.update_queues(queue_ns, queue_ew)

        signal_state = self.signal_controller.tick()

        # Emergency preemption clearance
        emergency_vehicles = [v for v in self.vehicles if v.is_emergency]
        for ev in emergency_vehicles:
            if ev.dist <= 0:
                self.signal_controller.clear_emergency_preemption()

        # Check active pedestrians and enforce pedestrian safety hold on signals
        ped_active_ns = any(p.approach in ['N', 'S'] for p in self.pedestrians)
        ped_active_ew = any(p.approach in ['E', 'W'] for p in self.pedestrians)
        if ped_active_ns and not signal_state.get("green_corridor", {}).get("active"):
            signal_state["ns_light"] = "RED"
        if ped_active_ew and not signal_state.get("green_corridor", {}).get("active"):
            signal_state["ew_light"] = "RED"

        ns_can_go = (signal_state["ns_light"] == "GREEN") and not ped_active_ns
        ew_can_go = (signal_state["ew_light"] == "GREEN") and not ped_active_ew

        # Update vehicle movements with pedestrian crosswalk yield checking
        for approach in ['N', 'S', 'E', 'W']:
            app_vehicles = sorted([v for v in self.vehicles if v.approach == approach], key=lambda v: v.dist)
            can_go = ns_can_go if approach in ['N', 'S'] else ew_can_go
            ped_active = any(p.approach == approach for p in self.pedestrians)

            for i, v in enumerate(app_vehicles):
                leader_dist = app_vehicles[i - 1].dist if i > 0 else None
                v.update(dt, can_go, leader_dist, pedestrian_crossing=ped_active)

        cleared_this_tick = [v for v in self.vehicles if v.cleared]
        for v in cleared_this_tick:
            self.total_cleared += 1
            self.total_wait_time += v.waiting_time

        self.vehicles = [v for v in self.vehicles if not v.cleared]

        active_count = len(self.vehicles)
        total_waiting_now = sum(1 for v in self.vehicles if v.stopped)
        
        if self.signal_controller.mode == "ADAPTIVE":
            self.co2_saved_kg += (total_waiting_now * 0.04 * 0.32 * dt) / 1000.0

        avg_wait = (self.total_wait_time / max(1, self.total_cleared)) if self.total_cleared > 0 else 8.5
        baseline_fixed_wait = 21.0 if self.traffic_density == "RUSH_HOUR" else (16.5 if self.traffic_density == "MEDIUM" else 11.0)
        wait_reduction_pct = max(0.0, min(65.0, ((baseline_fixed_wait - avg_wait) / baseline_fixed_wait) * 100.0))
        if self.signal_controller.mode == "FIXED":
            wait_reduction_pct = 0.0

        congestion_index = min(100, int((len([v for v in self.vehicles if v.dist > 15.0]) / 36.0) * 100))
        avg_speed = sum(v.speed for v in self.vehicles) / max(1, len(self.vehicles))

        by_type = {
            "car": {"count": 0, "avg_speed": 0.0, "speeds": []},
            "motorcycle": {"count": 0, "avg_speed": 0.0, "speeds": []},
            "bus": {"count": 0, "avg_speed": 0.0, "speeds": []},
            "truck": {"count": 0, "avg_speed": 0.0, "speeds": []},
            "ambulance": {"count": 0, "avg_speed": 0.0, "speeds": []},
        }
        for v in self.vehicles:
            t = "ambulance" if v.is_emergency else v.type
            if t in by_type:
                by_type[t]["count"] += 1
                by_type[t]["speeds"].append(v.speed)

        for t, d in by_type.items():
            d["avg_speed"] = round(sum(d["speeds"]) / len(d["speeds"]), 1) if d["speeds"] else 0.0
            del d["speeds"]

        viz_vehicles = []
        for v in self.vehicles:
            viz_vehicles.append({
                "id": v.id,
                "approach": v.approach,
                "type": v.type,
                "dist": round(v.dist, 1),
                "speed": round(v.speed, 1),
                "stopped": v.stopped,
                "is_emergency": v.is_emergency
            })

        viz_pedestrians = []
        for p in self.pedestrians:
            viz_pedestrians.append({
                "id": p.id,
                "approach": p.approach,
                "progress": round(p.progress, 2)
            })

        return {
            "cam_id": self.cam_id,
            "config": self.config,
            "signals": signal_state,
            "metrics": {
                "active_vehicles": active_count,
                "total_cleared": self.total_cleared,
                "avg_speed_kmh": round(avg_speed, 1),
                "avg_wait_sec": round(avg_wait, 1),
                "congestion_index": congestion_index,
                "wait_reduction_pct": round(wait_reduction_pct, 1),
                "co2_saved_kg": round(self.co2_saved_kg, 3),
                "traffic_density": self.traffic_density,
                "by_type": by_type
            },
            "vehicles": viz_vehicles,
            "pedestrians": viz_pedestrians,
            "crosswalk_active": len(viz_pedestrians) > 0
        }


class MultiJunctionNetwork:
    """Manages 8 concurrent intersection simulations matching the 8 municipal camera presets."""
    def __init__(self):
        self.junctions: Dict[str, IntersectionSimulator] = {}
        for cam_id in JUNCTION_CONFIGS.keys():
            self.junctions[cam_id] = IntersectionSimulator(cam_id=cam_id)
        self.active_cam = "CAM-03"

    @property
    def signal_controller(self):
        return self.junctions[self.active_cam].signal_controller

    @property
    def traffic_density(self):
        return self.junctions[self.active_cam].traffic_density

    def set_density(self, density: str, cam_id: Optional[str] = None):
        targets = [self.junctions[cam_id]] if (cam_id and cam_id in self.junctions) else list(self.junctions.values())
        for junc in targets:
            junc.set_density(density)

    def set_controller_mode(self, mode: str, cam_id: Optional[str] = None):
        targets = [self.junctions[cam_id]] if (cam_id and cam_id in self.junctions) else list(self.junctions.values())
        for junc in targets:
            junc.set_controller_mode(mode)

    def inject_emergency_vehicle(self, approach: str = "N", cam_id: Optional[str] = None):
        targets = [self.junctions[cam_id]] if (cam_id and cam_id in self.junctions) else list(self.junctions.values())
        for junc in targets:
            junc.inject_emergency_vehicle(approach)

    def trigger_pedestrian_crossing(self, approach: str = "N", cam_id: Optional[str] = None):
        targets = [self.junctions[cam_id]] if (cam_id and cam_id in self.junctions) else list(self.junctions.values())
        for junc in targets:
            junc.trigger_pedestrian_crossing(approach)

    def tick(self) -> Dict[str, Any]:
        all_states = {}
        for cam_id, junc in self.junctions.items():
            all_states[cam_id] = junc.tick()

        primary_state = all_states.get(self.active_cam, list(all_states.values())[0])

        total_active_all = sum(s["metrics"]["active_vehicles"] for s in all_states.values())
        avg_wait_all = round(sum(s["metrics"]["avg_wait_sec"] for s in all_states.values()) / len(all_states), 1)
        avg_speed_all = round(sum(s["metrics"]["avg_speed_kmh"] for s in all_states.values()) / len(all_states), 1)
        total_co2_all = round(sum(s["metrics"]["co2_saved_kg"] for s in all_states.values()), 3)
        avg_wait_red_all = round(sum(s["metrics"]["wait_reduction_pct"] for s in all_states.values()) / len(all_states), 1)

        aggregated_metrics = {
            **primary_state["metrics"],
            "network_active_targets": total_active_all,
            "network_avg_wait_sec": avg_wait_all,
            "network_avg_speed_kmh": avg_speed_all,
            "network_co2_saved_kg": total_co2_all,
            "network_wait_reduction_pct": avg_wait_red_all,
            "junctions_count": len(all_states)
        }

        return {
            "signals": primary_state["signals"],
            "metrics": aggregated_metrics,
            "vehicles": primary_state["vehicles"],
            "pedestrians": primary_state.get("pedestrians", []),
            "crosswalk_active": primary_state.get("crosswalk_active", False),
            "junctions": all_states
        }
