"""
UrbanFlow AI - Computer Vision & Traffic Analysis Engine
Handles vehicle detection, multi-object tracking, speed estimation, 
lane trajectory analysis, and infraction/violation logging.
"""

import time
import math
import random
import cv2
import numpy as np
from typing import List, Dict, Any, Optional

class TrackedVehicle:
    def __init__(self, vehicle_id: int, v_type: str, x: float, y: float, vx: float, vy: float, lane: int, is_emergency: bool = False):
        self.id = vehicle_id
        self.type = v_type
        self.x = x
        self.y = y
        self.vx = vx
        self.vy = vy
        self.lane = lane
        self.is_emergency = is_emergency
        self.history: List[tuple] = []
        self.speed_kmh = abs(vy) * 2.2 + random.uniform(-1.5, 1.5)
        self.width = 44 if v_type == "truck" or v_type == "bus" else (30 if v_type == "car" or v_type == "ambulance" else 16)
        self.length = 75 if v_type == "truck" or v_type == "bus" else (50 if v_type == "car" or v_type == "ambulance" else 28)
        self.color = self._get_color()
        self.violations: List[str] = []
        self.created_at = time.time()
        self.stopped = False
        self.stop_time = 0.0

    def _get_color(self):
        if self.is_emergency:
            return (255, 255, 255) # White body with red cross
        colors = {
            "car": [(42, 100, 240), (220, 180, 50), (200, 50, 180), (50, 200, 120), (220, 220, 220), (60, 60, 60)],
            "truck": [(50, 120, 200), (40, 160, 80), (140, 80, 50)],
            "bus": [(30, 180, 240), (240, 120, 40)],
            "motorcycle": [(180, 50, 50), (50, 180, 50), (20, 20, 220)]
        }
        return random.choice(colors.get(self.type, [(150, 150, 150)]))

    def update(self, red_light_active: bool, stop_line_y: float, speed_limit: float = 60.0):
        # Check if approaching stop line during red light
        distance_to_stop = stop_line_y - (self.y + self.length / 2)
        
        # Emergency vehicles do not stop on red light
        if red_light_active and not self.is_emergency:
            if 0 < distance_to_stop < 90:
                # Decelerate to stop
                self.vy = max(0.0, self.vy - 0.4)
                if self.vy < 0.2:
                    self.vy = 0.0
                    self.stopped = True
                    self.stop_time += 0.03
            else:
                self.stopped = False
        else:
            self.stopped = False
            # Accelerate back to normal speed
            target_vy = 16.0 + (self.lane * 3.0) + (10.0 if self.is_emergency else 0.0)
            if self.vy < target_vy:
                self.vy = min(target_vy, self.vy + 0.3)

        self.y += self.vy
        self.speed_kmh = self.vy * 2.8

        # Record trajectory
        self.history.append((int(self.x), int(self.y)))
        if len(self.history) > 25:
            self.history.pop(0)

        # Violation checks against camera speed limit
        if self.speed_kmh > (speed_limit + 5.0) and not self.is_emergency and "Overspeeding" not in self.violations:
            self.violations.append("Overspeeding")
        
        if red_light_active and not self.is_emergency and (self.y > stop_line_y) and (self.y - self.vy <= stop_line_y):
            if "Red Light Violation" not in self.violations:
                self.violations.append("Red Light Violation")


class TrafficVisionEngine:
    """
    Simulates high-resolution CCTV camera feed with dynamic AI overlay
    including YOLO bounding boxes, vehicle classifications, trajectory tails,
    instant speed tags, and violation alerts.
    """
    def __init__(
        self,
        cam_id: str = "CAM-01",
        cam_label: str = "Highway 101 Inflow",
        area: str = "North Expressway",
        speed_limit: float = 60.0,
        width: int = 760,
        height: int = 440
    ):
        self.cam_id = cam_id
        self.cam_label = cam_label
        self.area = area
        self.speed_limit = speed_limit
        self.width = width
        self.height = height
        self.vehicles: Dict[int, TrackedVehicle] = {}
        self.next_id = 101
        self.stop_line_y = height * 0.58
        self.red_light_active = False
        self.recent_violations: List[Dict[str, Any]] = []
        
        # Lanes configuration (x-coordinates for 3 incoming lanes)
        self.lane_xs = [width * 0.28, width * 0.45, width * 0.62]
        self.last_spawn_time = 0.0
        self.spawn_interval = 1.2
        self.emergency_requested = False

        # Display Toggles
        self.show_boxes = True
        self.show_speeds = True
        self.show_trajectories = True
        self.show_lanes = True

    def trigger_emergency_vehicle(self):
        """Spawns an emergency ambulance in lane 1"""
        self.emergency_requested = True

    def set_red_light(self, active: bool):
        self.red_light_active = active

    def _spawn_vehicle(self):
        now = time.time()
        if self.emergency_requested:
            v = TrackedVehicle(
                vehicle_id=self.next_id,
                v_type="ambulance",
                x=self.lane_xs[1],
                y=-60,
                vx=0,
                vy=22.0,
                lane=1,
                is_emergency=True
            )
            self.vehicles[self.next_id] = v
            self.next_id += 1
            self.emergency_requested = False
            return

        if now - self.last_spawn_time < self.spawn_interval:
            return

        lane = random.choice([0, 1, 2])
        lane_x = self.lane_xs[lane] + random.uniform(-10, 10)

        # Check if lane entrance is blocked
        for v in self.vehicles.values():
            if abs(v.x - lane_x) < 35 and v.y < 70:
                return

        v_type_weights = ["car", "car", "car", "motorcycle", "motorcycle", "truck", "bus"]
        v_type = random.choice(v_type_weights)
        
        # Occasionally introduce high speed for violation demo
        base_speed = random.choice([16.0, 18.0, 20.0, 26.0 if random.random() < 0.25 else 17.0])
        
        v = TrackedVehicle(
            vehicle_id=self.next_id,
            v_type=v_type,
            x=lane_x,
            y=-50,
            vx=0,
            vy=base_speed,
            lane=lane,
            is_emergency=False
        )
        self.vehicles[self.next_id] = v
        self.next_id += 1
        self.last_spawn_time = now

    def update(self):
        self._spawn_vehicle()
        to_delete = []

        for vid, v in list(self.vehicles.items()):
            v.update(self.red_light_active, self.stop_line_y, self.speed_limit)

            # Record any new violations
            for vio in v.violations:
                if not any(rv['vehicle_id'] == vid and rv['type'] == vio for rv in self.recent_violations):
                    record = {
                        "id": f"VIO-{int(time.time()*1000)%100000}",
                        "vehicle_id": vid,
                        "type": vio,
                        "camera_id": self.cam_id,
                        "area": self.area,
                        "vehicle_type": v.type.capitalize(),
                        "speed": f"{v.speed_kmh:.1f} km/h",
                        "timestamp": time.strftime("%H:%M:%S"),
                        "status": "FLAGGED"
                    }
                    self.recent_violations.insert(0, record)
                    if len(self.recent_violations) > 40:
                        self.recent_violations.pop()

            # Remove vehicles exiting frame
            if v.y > self.height + 60:
                to_delete.append(vid)

        for vid in to_delete:
            del self.vehicles[vid]

    def render_frame(self) -> np.ndarray:
        """Draws realistic asphalt roadway, lane dividers, vehicles, and CV bounding boxes"""
        self.update()
        frame = np.zeros((self.height, self.width, 3), dtype=np.uint8)

        # Background: Dark urban asphalt
        frame[:] = (32, 34, 38)

        # Road boundaries
        road_left = int(self.width * 0.16)
        road_right = int(self.width * 0.84)
        cv2.rectangle(frame, (road_left, 0), (road_right, self.height), (45, 48, 54), -1)

        # Curbs / Sidewalks
        cv2.rectangle(frame, (0, 0), (road_left, self.height), (24, 26, 29), -1)
        cv2.rectangle(frame, (road_right, 0), (self.width, self.height), (24, 26, 29), -1)

        # Lane dividers (dashed white lines)
        if self.show_lanes:
            div1_x = int(self.width * 0.38)
            div2_x = int(self.width * 0.55)
            for y in range(0, self.height, 40):
                cv2.line(frame, (div1_x, y), (div1_x, y + 20), (160, 160, 160), 2)
                cv2.line(frame, (div2_x, y), (div2_x, y + 20), (160, 160, 160), 2)

        # Stop Line
        stop_y = int(self.stop_line_y)
        stop_color = (40, 40, 240) if self.red_light_active else (220, 220, 220)
        cv2.line(frame, (road_left + 4, stop_y), (road_right - 4, stop_y), stop_color, 4)
        
        # Stop line status text
        stop_txt = "STOP LINE [SIGNAL: RED]" if self.red_light_active else "STOP LINE [SIGNAL: GREEN]"
        cv2.putText(frame, stop_txt, (road_left + 8, stop_y - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.42, stop_color, 1, cv2.LINE_AA)

        # Zebra crossing stripes
        for x in range(road_left + 15, road_right - 15, 35):
            cv2.rectangle(frame, (x, stop_y + 8), (x + 20, stop_y + 35), (180, 180, 180), -1)

        # Render Trajectories
        if self.show_trajectories:
            for v in self.vehicles.values():
                if len(v.history) > 1:
                    pts = np.array(v.history, np.int32).reshape((-1, 1, 2))
                    trail_color = (0, 140, 255) if v.is_emergency else (0, 230, 255)
                    cv2.polylines(frame, [pts], False, trail_color, 2, cv2.LINE_AA)

        # Render Vehicles
        for vid, v in self.vehicles.items():
            vx, vy = int(v.x), int(v.y)
            w, h = v.width, v.length
            x1, y1 = vx - w // 2, vy - h // 2
            x2, y2 = vx + w // 2, vy + h // 2

            # Vehicle body
            if v.is_emergency:
                # Ambulance body
                cv2.rectangle(frame, (x1, y1), (x2, y2), (245, 245, 245), -1, cv2.LINE_AA)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 220), 2, cv2.LINE_AA)
                # Red cross on roof
                cv2.rectangle(frame, (vx - 3, vy - 10), (vx + 3, vy + 10), (0, 0, 240), -1)
                cv2.rectangle(frame, (vx - 10, vy - 3), (vx + 10, vy + 3), (0, 0, 240), -1)
                # Flashing siren
                siren_color = (0, 0, 255) if int(time.time() * 8) % 2 == 0 else (255, 0, 0)
                cv2.circle(frame, (vx, y1 + 6), 5, siren_color, -1)
            else:
                # Regular vehicle body
                cv2.rectangle(frame, (x1, y1), (x2, y2), v.color, -1, cv2.LINE_AA)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (30, 30, 30), 1, cv2.LINE_AA)
                # Windshield / glass
                glass_y1 = y1 + int(h * 0.22)
                glass_y2 = y1 + int(h * 0.40)
                cv2.rectangle(frame, (x1 + 3, glass_y1), (x2 - 3, glass_y2), (70, 75, 80), -1)
                # Headlights
                cv2.circle(frame, (x1 + 4, y2 - 3), 2, (100, 255, 255), -1)
                cv2.circle(frame, (x2 - 4, y2 - 3), 2, (100, 255, 255), -1)

            # AI Detection Bounding Box
            if self.show_boxes:
                has_violation = len(v.violations) > 0
                if v.is_emergency:
                    box_color = (0, 220, 255) # Cyan/Gold for emergency
                elif has_violation:
                    box_color = (40, 40, 255) # Bright red for violation
                else:
                    box_color = (50, 230, 80) # Neon green for normal tracking

                # Draw outer bounding box with target corners
                cv2.rectangle(frame, (x1 - 4, y1 - 4), (x2 + 4, y2 + 4), box_color, 2)
                
                # Tag label background
                label = f"{v.type.upper()} #{v.id}"
                if self.show_speeds:
                    label += f" | {v.speed_kmh:.0f} km/h"
                if v.is_emergency:
                    label = f"EMERGENCY | #{v.id}"
                
                (lw, lh), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.38, 1)
                cv2.rectangle(frame, (x1 - 4, y1 - 20), (x1 - 4 + lw + 8, y1 - 4), box_color, -1)
                cv2.putText(frame, label, (x1, y1 - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (0, 0, 0), 1, cv2.LINE_AA)

                # Violation Alert Badge
                if has_violation:
                    vio_label = f"! {v.violations[0].upper()}"
                    (vw, vh), _ = cv2.getTextSize(vio_label, cv2.FONT_HERSHEY_SIMPLEX, 0.36, 1)
                    cv2.rectangle(frame, (x1 - 4, y2 + 6), (x1 - 4 + vw + 8, y2 + 20), (30, 30, 220), -1)
                    cv2.putText(frame, vio_label, (x1, y2 + 17), cv2.FONT_HERSHEY_SIMPLEX, 0.36, (255, 255, 255), 1, cv2.LINE_AA)

        # HUD / Camera Watermark Overlay
        self._render_hud(frame)
        return frame

    def _render_hud(self, frame: np.ndarray):
        # Top-left camera telemetry with dynamic camera ID, area, and label
        hud_title = f"{self.cam_id} [{self.area.upper()} : {self.cam_label.upper()}]"
        cv2.putText(frame, hud_title, (14, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (220, 220, 220), 1, cv2.LINE_AA)
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(frame, f"REC: {timestamp} | 30.0 FPS | LIMIT: {int(self.speed_limit)} KM/H", (14, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.36, (0, 255, 140), 1, cv2.LINE_AA)

        # Top-right detection counts
        active_count = len(self.vehicles)
        avg_speed = np.mean([v.speed_kmh for v in self.vehicles.values()]) if self.vehicles else 0.0
        cv2.putText(frame, f"TARGETS: {active_count:02d}", (self.width - 130, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.44, (0, 230, 255), 1, cv2.LINE_AA)
        cv2.putText(frame, f"AVG: {avg_speed:.1f} KM/H", (self.width - 130, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (200, 200, 200), 1, cv2.LINE_AA)

    def generate_jpeg_stream(self):
        """Yields multipart MJPEG frame chunks for HTTP video streaming"""
        while True:
            frame = self.render_frame()
            ret, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
            if not ret:
                time.sleep(0.03)
                continue
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            time.sleep(0.033) # ~30 FPS


CAMERA_PRESETS = [
    {"id": "CAM-01", "label": "Highway 101 Inflow", "area": "North Expressway", "limit": 70.0},
    {"id": "CAM-02", "label": "Express Toll Plaza", "area": "North Expressway", "limit": 60.0},
    {"id": "CAM-03", "label": "Central 4-Way Junction", "area": "Downtown Commercial", "limit": 50.0},
    {"id": "CAM-04", "label": "Main Ave Transit Hub", "area": "Downtown Commercial", "limit": 40.0},
    {"id": "CAM-05", "label": "East Boulevard Inflow", "area": "Tech Park Corridor", "limit": 60.0},
    {"id": "CAM-06", "label": "West Metro Interchange", "area": "Tech Park Corridor", "limit": 45.0},
    {"id": "CAM-07", "label": "Trauma Center Emergency Gate", "area": "Hospital Green Route", "limit": 50.0},
    {"id": "CAM-08", "label": "Green Route Clearance Sensor", "area": "Hospital Green Route", "limit": 50.0},
]


class MultiCameraManager:
    """Manages multi-area CCTV cameras across the metropolitan network"""
    def __init__(self):
        self.cameras: Dict[str, TrafficVisionEngine] = {}
        for cfg in CAMERA_PRESETS:
            self.cameras[cfg["id"]] = TrafficVisionEngine(
                cam_id=cfg["id"],
                cam_label=cfg["label"],
                area=cfg["area"],
                speed_limit=cfg["limit"]
            )

    def get_camera(self, cam_id: str) -> TrafficVisionEngine:
        return self.cameras.get(cam_id, self.cameras["CAM-01"])

    def list_cameras(self) -> List[Dict[str, Any]]:
        result = []
        for cfg in CAMERA_PRESETS:
            cam = self.cameras[cfg["id"]]
            result.append({
                "id": cfg["id"],
                "label": cfg["label"],
                "area": cfg["area"],
                "limit": cfg["limit"],
                "status": "ONLINE",
                "resolution": f"{cam.width}x{cam.height}",
                "active_targets": len(cam.vehicles),
                "fps": 30.0
            })
        return result

    def set_red_light_all(self, active: bool):
        for cam in self.cameras.values():
            cam.set_red_light(active)

    def trigger_emergency_all(self):
        for cam in self.cameras.values():
            cam.trigger_emergency_vehicle()

    def get_all_violations(self) -> List[Dict[str, Any]]:
        all_v = []
        for cam in self.cameras.values():
            all_v.extend(cam.recent_violations)
        all_v.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return all_v[:60]


# Global instance
camera_manager = MultiCameraManager()

