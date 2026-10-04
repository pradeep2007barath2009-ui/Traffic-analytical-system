"""
UrbanFlow AI - Computer Vision & Traffic Analysis Engine
Handles vehicle detection, pedestrian crosswalk tracking, multi-object tracking, speed estimation,
lane trajectory analysis, and infraction/violation logging for both
real video streams (webcams, RTSP, video files) and synthetic simulation.
"""

import time
import math
import random
import os
import cv2
import numpy as np
from typing import List, Dict, Any, Optional, Union

# Import camera configuration
try:
    from backend.camera_config import (
        CAMERA_SOURCE,
        SPEED_CALIBRATION_FACTOR,
        STOP_LINE_Y_RATIO,
        MIN_CONTOUR_AREA
    )
except ImportError:
    CAMERA_SOURCE = None
    SPEED_CALIBRATION_FACTOR = 2.8
    STOP_LINE_Y_RATIO = 0.58
    MIN_CONTOUR_AREA = 800

# Try optional YOLOv8 detection
try:
    from ultralytics import YOLO
    _YOLO_MODEL = YOLO("yolov8n.pt")
except Exception:
    _YOLO_MODEL = None


class TrackedPedestrian:
    """Models a pedestrian crossing the road along the designated zebra crosswalk"""
    def __init__(self, ped_id: int, y: float, direction: int = 1, width: int = 760):
        self.id = ped_id
        self.direction = direction  # 1: walking left-to-right, -1: right-to-left
        self.y = y
        self.x = (width * 0.12) if direction == 1 else (width * 0.88)
        self.speed = 1.4 * direction
        self.speed_kmh = 4.8
        self.width = 18
        self.height = 36
        self.cleared = False
        self.in_crosswalk = True
        self.history: List[tuple] = []

    def update(self, road_left: float, road_right: float):
        self.x += self.speed
        self.history.append((int(self.x), int(self.y)))
        if len(self.history) > 15:
            self.history.pop(0)

        # Check if crossed past curb
        if (self.direction == 1 and self.x > road_right + 25) or (self.direction == -1 and self.x < road_left - 25):
            self.cleared = True
            self.in_crosswalk = False


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
            return (255, 255, 255)
        colors = {
            "car": [(42, 100, 240), (220, 180, 50), (200, 50, 180), (50, 200, 120), (220, 220, 220), (60, 60, 60)],
            "truck": [(50, 120, 200), (40, 160, 80), (140, 80, 50)],
            "bus": [(30, 180, 240), (240, 120, 40)],
            "motorcycle": [(180, 50, 50), (50, 180, 50), (20, 20, 220)]
        }
        return random.choice(colors.get(self.type, [(150, 150, 150)]))

    def update(self, red_light_active: bool, stop_line_y: float, speed_limit: float = 60.0, pedestrian_in_crosswalk: bool = False):
        distance_to_stop = stop_line_y - (self.y + self.length / 2)
        
        # Vehicles must stop on red light OR yield to pedestrians on crosswalk
        must_stop = (red_light_active or pedestrian_in_crosswalk) and not self.is_emergency

        if must_stop:
            if 0 < distance_to_stop < 95:
                self.vy = max(0.0, self.vy - 0.45)
                if self.vy < 0.2:
                    self.vy = 0.0
                    self.stopped = True
                    self.stop_time += 0.03
            else:
                self.stopped = False
        else:
            self.stopped = False
            target_vy = 16.0 + (self.lane * 3.0) + (10.0 if self.is_emergency else 0.0)
            if self.vy < target_vy:
                self.vy = min(target_vy, self.vy + 0.3)

        self.y += self.vy
        self.speed_kmh = self.vy * 2.8

        self.history.append((int(self.x), int(self.y)))
        if len(self.history) > 25:
            self.history.pop(0)

        # Violation checks
        if self.speed_kmh > (speed_limit + 5.0) and not self.is_emergency and "Overspeeding" not in self.violations:
            self.violations.append("Overspeeding")
        
        if red_light_active and not self.is_emergency and (self.y > stop_line_y) and (self.y - self.vy <= stop_line_y):
            if "Red Light Violation" not in self.violations:
                self.violations.append("Red Light Violation")

        # Failure to yield to pedestrian violation
        if pedestrian_in_crosswalk and not self.is_emergency and (self.y > stop_line_y - 10) and (self.y < stop_line_y + 45):
            if self.speed_kmh > 8.0 and "Failure to Yield to Pedestrian" not in self.violations:
                self.violations.append("Failure to Yield to Pedestrian")


class TrafficVisionEngine:
    """
    Manages CCTV camera video feed with dynamic AI overlay.
    Supports physical cameras (USB webcams, RTSP streams, video files)
    as well as realistic synthetic traffic and pedestrian crosswalk simulation.
    """
    def __init__(
        self,
        cam_id: str = "CAM-01",
        cam_label: str = "Highway 101 Inflow",
        area: str = "North Expressway",
        speed_limit: float = 60.0,
        width: int = 760,
        height: int = 440,
        source: Optional[Union[int, str]] = None
    ):
        self.cam_id = cam_id
        self.cam_label = cam_label
        self.area = area
        self.speed_limit = speed_limit
        self.width = width
        self.height = height
        self.source = source
        self.cap = None
        self.is_real_camera = False
        self.bg_subtractor = None
        self.prev_centroids: Dict[int, tuple] = {}

        self.vehicles: Dict[int, TrackedVehicle] = {}
        self.pedestrians: List[TrackedPedestrian] = []
        self.next_id = 101
        self.next_ped_id = 1
        self.stop_line_y = height * STOP_LINE_Y_RATIO
        self.zebra_top = int(self.stop_line_y + 8)
        self.zebra_bottom = int(self.stop_line_y + 38)
        self.red_light_active = False
        self.recent_violations: List[Dict[str, Any]] = []
        
        self.lane_xs = [width * 0.28, width * 0.45, width * 0.62]
        self.last_spawn_time = 0.0
        self.spawn_interval = 1.2
        self.emergency_requested = False

        # Display Toggles
        self.show_boxes = True
        self.show_speeds = True
        self.show_trajectories = True
        self.show_lanes = True

        if self.source is not None:
            self._init_camera_source()

    def _init_camera_source(self):
        try:
            self.cap = cv2.VideoCapture(self.source)
            if self.cap.isOpened():
                self.is_real_camera = True
                self.bg_subtractor = cv2.createBackgroundSubtractorMOG2(history=300, varThreshold=50, detectShadows=True)
                print(f"[+] Physical camera initialized for {self.cam_id}: {self.source}")
            else:
                self.cap = None
                self.is_real_camera = False
                print(f"[!] Could not open camera {self.source} for {self.cam_id}; using simulation.")
        except Exception as e:
            self.cap = None
            self.is_real_camera = False
            print(f"[!] Camera initialization error: {e}")

    def set_source(self, source: Optional[Union[int, str]]):
        if self.cap is not None:
            try:
                self.cap.release()
            except Exception:
                pass
        self.source = source
        self.cap = None
        self.is_real_camera = False
        if source is not None:
            self._init_camera_source()

    def trigger_emergency_vehicle(self):
        self.emergency_requested = True

    def trigger_pedestrian_crossing(self):
        """Dispatches a pedestrian to walk across the zebra crossing"""
        direction = 1 if len(self.pedestrians) % 2 == 0 else -1
        y_pos = random.uniform(self.zebra_top + 4, self.zebra_bottom - 4)
        ped = TrackedPedestrian(ped_id=self.next_ped_id, y=y_pos, direction=direction, width=self.width)
        self.next_ped_id += 1
        self.pedestrians.append(ped)

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

        for v in self.vehicles.values():
            if abs(v.x - lane_x) < 35 and v.y < 70:
                return

        v_type_weights = ["car", "car", "car", "motorcycle", "motorcycle", "truck", "bus"]
        v_type = random.choice(v_type_weights)
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
        
        # Update pedestrians
        road_left = self.width * 0.16
        road_right = self.width * 0.84
        for ped in self.pedestrians:
            ped.update(road_left, road_right)
        self.pedestrians = [p for p in self.pedestrians if not p.cleared]

        ped_in_crosswalk = any(p.in_crosswalk for p in self.pedestrians)

        to_delete = []
        for vid, v in list(self.vehicles.items()):
            v.update(self.red_light_active, self.stop_line_y, self.speed_limit, pedestrian_in_crosswalk=ped_in_crosswalk)

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

            if v.y > self.height + 60:
                to_delete.append(vid)

        for vid in to_delete:
            del self.vehicles[vid]

    def _render_real_camera_frame(self) -> Optional[np.ndarray]:
        if self.cap is None or not self.cap.isOpened():
            return None

        ret, frame = self.cap.read()
        if not ret or frame is None:
            if isinstance(self.source, str) and os.path.exists(self.source):
                self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                ret, frame = self.cap.read()
            if not ret or frame is None:
                return None

        frame = cv2.resize(frame, (self.width, self.height))

        # Lane & crosswalk overlay
        if self.show_lanes:
            stop_y = int(self.stop_line_y)
            stop_color = (40, 40, 240) if self.red_light_active else (50, 230, 80)
            cv2.line(frame, (20, stop_y), (self.width - 20, stop_y), stop_color, 2)
            lbl = "STOP LINE [SIGNAL: RED]" if self.red_light_active else "STOP LINE [SIGNAL: GREEN]"
            cv2.putText(frame, lbl, (25, stop_y - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.42, stop_color, 1, cv2.LINE_AA)

            # Virtual zebra crosswalk corridor
            for x in range(30, self.width - 30, 40):
                cv2.rectangle(frame, (x, self.zebra_top), (x + 22, self.zebra_bottom), (200, 200, 200), 1)

        detected_boxes = []
        pedestrians_found = []

        if _YOLO_MODEL is not None:
            try:
                results = _YOLO_MODEL.predict(frame, conf=0.35, verbose=False)
                for r in results:
                    for box in r.boxes:
                        cls_id = int(box.cls[0])
                        # 0=Person, 2=car, 3=motorcycle, 5=bus, 7=truck
                        if cls_id == 0:
                            xyxy = box.xyxy[0].cpu().numpy().astype(int)
                            conf = float(box.conf[0])
                            pedestrians_found.append({"box": xyxy, "conf": conf})
                        elif cls_id in [2, 3, 5, 7]:
                            cls_names = {2: "Car", 3: "Motorcycle", 5: "Bus", 7: "Truck"}
                            xyxy = box.xyxy[0].cpu().numpy().astype(int)
                            conf = float(box.conf[0])
                            detected_boxes.append({
                                "box": xyxy,
                                "type": cls_names[cls_id],
                                "conf": conf
                            })
            except Exception:
                pass

        if not detected_boxes and not pedestrians_found and self.bg_subtractor is not None:
            fg_mask = self.bg_subtractor.apply(frame)
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
            fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_OPEN, kernel)
            contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            for cnt in contours:
                area = cv2.contourArea(cnt)
                if area > MIN_CONTOUR_AREA:
                    x, y, w, h = cv2.boundingRect(cnt)
                    aspect = h / max(1, w)
                    if aspect > 1.8 and h < 120:
                        pedestrians_found.append({"box": [x, y, x + w, y + h], "conf": 0.82})
                    else:
                        detected_boxes.append({"box": [x, y, x + w, y + h], "type": "Vehicle", "conf": 0.85})

        # Draw Pedestrian Bounding Boxes
        for p in pedestrians_found:
            px1, py1, px2, py2 = p["box"]
            p_feet_y = py2
            in_crosswalk = (self.zebra_top - 15 <= p_feet_y <= self.zebra_bottom + 20)

            p_color = (0, 240, 255) if in_crosswalk else (220, 180, 50)
            cv2.rectangle(frame, (px1, py1), (px2, py2), p_color, 2)
            p_label = "PERSON [CROSSWALK]" if in_crosswalk else "PERSON [SIDEWALK]"
            (pw, ph), _ = cv2.getTextSize(p_label, cv2.FONT_HERSHEY_SIMPLEX, 0.36, 1)
            cv2.rectangle(frame, (px1, py1 - 18), (px1 + pw + 6, py1), p_color, -1)
            cv2.putText(frame, p_label, (px1 + 3, py1 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.36, (0, 0, 0), 1, cv2.LINE_AA)

        # Draw Vehicle Bounding Boxes & check yield
        has_ped_in_crosswalk = any(self.zebra_top - 15 <= p["box"][3] <= self.zebra_bottom + 20 for p in pedestrians_found)

        if self.show_boxes:
            for i, det in enumerate(detected_boxes):
                x1, y1, x2, y2 = det["box"]
                cx = (x1 + x2) // 2
                cy = (y1 + y2) // 2
                v_type = det["type"]

                prev_pos = self.prev_centroids.get(i, (cx, cy))
                dy = abs(cy - prev_pos[1])
                speed = max(15.0, min(95.0, dy * SPEED_CALIBRATION_FACTOR * 4.0))
                self.prev_centroids[i] = (cx, cy)

                is_speeding = speed > self.speed_limit + 5.0
                is_red_light = self.red_light_active and cy > self.stop_line_y and prev_pos[1] <= self.stop_line_y
                is_fail_yield = has_ped_in_crosswalk and (cy > self.stop_line_y - 10) and speed > 10.0

                has_violation = is_speeding or is_red_light or is_fail_yield
                box_color = (40, 40, 255) if has_violation else (50, 230, 80)
                cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, 2)

                label = f"{v_type.upper()}"
                if self.show_speeds:
                    label += f" | {speed:.0f} km/h"
                (lw, lh), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.38, 1)
                cv2.rectangle(frame, (x1, y1 - 20), (x1 + lw + 8, y1), box_color, -1)
                cv2.putText(frame, label, (x1 + 4, y1 - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (0, 0, 0), 1, cv2.LINE_AA)

                if has_violation:
                    vio_name = "Failure to Yield to Pedestrian" if is_fail_yield else ("Overspeeding" if is_speeding else "Red Light Violation")
                    if not any(rv['type'] == vio_name for rv in self.recent_violations[:3]):
                        record = {
                            "id": f"VIO-{int(time.time()*1000)%100000}",
                            "vehicle_id": 200 + i,
                            "type": vio_name,
                            "camera_id": self.cam_id,
                            "area": self.area,
                            "vehicle_type": v_type,
                            "speed": f"{speed:.0f} km/h",
                            "timestamp": time.strftime("%H:%M:%S"),
                            "status": "RECORDED"
                        }
                        self.recent_violations.insert(0, record)
                        if len(self.recent_violations) > 40:
                            self.recent_violations.pop()

        self._render_hud(frame, real_cam=True, target_count=len(detected_boxes), ped_count=len(pedestrians_found))
        return frame

    def render_frame(self) -> np.ndarray:
        if self.is_real_camera:
            real_frame = self._render_real_camera_frame()
            if real_frame is not None:
                return real_frame

        self.update()
        frame = np.zeros((self.height, self.width, 3), dtype=np.uint8)
        frame[:] = (32, 34, 38)

        road_left = int(self.width * 0.16)
        road_right = int(self.width * 0.84)
        cv2.rectangle(frame, (road_left, 0), (road_right, self.height), (45, 48, 54), -1)
        cv2.rectangle(frame, (0, 0), (road_left, self.height), (24, 26, 29), -1)
        cv2.rectangle(frame, (road_right, 0), (self.width, self.height), (24, 26, 29), -1)

        if self.show_lanes:
            div1_x = int(self.width * 0.38)
            div2_x = int(self.width * 0.55)
            for y in range(0, self.height, 40):
                cv2.line(frame, (div1_x, y), (div1_x, y + 20), (160, 160, 160), 2)
                cv2.line(frame, (div2_x, y), (div2_x, y + 20), (160, 160, 160), 2)

        stop_y = int(self.stop_line_y)
        stop_color = (40, 40, 240) if self.red_light_active else (220, 220, 220)
        cv2.line(frame, (road_left + 4, stop_y), (road_right - 4, stop_y), stop_color, 4)
        stop_txt = "STOP LINE [SIGNAL: RED]" if self.red_light_active else "STOP LINE [SIGNAL: GREEN]"
        cv2.putText(frame, stop_txt, (road_left + 8, stop_y - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.42, stop_color, 1, cv2.LINE_AA)

        # High-contrast Zebra Crossing
        for x in range(road_left + 15, road_right - 15, 35):
            cv2.rectangle(frame, (x, self.zebra_top), (x + 22, self.zebra_bottom), (210, 210, 210), -1)

        # Render Trajectories
        if self.show_trajectories:
            for v in self.vehicles.values():
                if len(v.history) > 1:
                    pts = np.array(v.history, np.int32).reshape((-1, 1, 2))
                    trail_color = (0, 140, 255) if v.is_emergency else (0, 230, 255)
                    cv2.polylines(frame, [pts], False, trail_color, 2, cv2.LINE_AA)
            for p in self.pedestrians:
                if len(p.history) > 1:
                    pts = np.array(p.history, np.int32).reshape((-1, 1, 2))
                    cv2.polylines(frame, [pts], False, (0, 240, 255), 1, cv2.LINE_AA)

        # Render Pedestrians on Crosswalk
        for p in self.pedestrians:
            px, py = int(p.x), int(p.y)
            # Body & head
            cv2.circle(frame, (px, py - 12), 4, (240, 200, 160), -1) # Head
            cv2.rectangle(frame, (px - 4, py - 8), (px + 4, py + 6), (50, 140, 240), -1) # Torso
            cv2.line(frame, (px - 2, py + 6), (px - 4, py + 16), (40, 40, 40), 2) # Left leg
            cv2.line(frame, (px + 2, py + 6), (px + 4, py + 16), (40, 40, 40), 2) # Right leg

            # Bounding Box
            if self.show_boxes:
                bx1, by1 = px - 8, py - 18
                bx2, by2 = px + 8, py + 18
                cv2.rectangle(frame, (bx1, by1), (bx2, by2), (0, 240, 255), 2)
                p_label = f"PERSON #{p.id} | {p.speed_kmh:.1f} km/h"
                (plw, plh), _ = cv2.getTextSize(p_label, cv2.FONT_HERSHEY_SIMPLEX, 0.34, 1)
                cv2.rectangle(frame, (bx1, by1 - 16), (bx1 + plw + 6, by1), (0, 240, 255), -1)
                cv2.putText(frame, p_label, (bx1 + 3, by1 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.34, (0, 0, 0), 1, cv2.LINE_AA)

        # Render Vehicles
        for vid, v in self.vehicles.items():
            vx, vy = int(v.x), int(v.y)
            w, h = v.width, v.length
            x1, y1 = vx - w // 2, vy - h // 2
            x2, y2 = vx + w // 2, vy + h // 2

            if v.is_emergency:
                cv2.rectangle(frame, (x1, y1), (x2, y2), (245, 245, 245), -1, cv2.LINE_AA)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 220), 2, cv2.LINE_AA)
                cv2.rectangle(frame, (vx - 3, vy - 10), (vx + 3, vy + 10), (0, 0, 240), -1)
                cv2.rectangle(frame, (vx - 10, vy - 3), (vx + 10, vy + 3), (0, 0, 240), -1)
                siren_color = (0, 0, 255) if int(time.time() * 8) % 2 == 0 else (255, 0, 0)
                cv2.circle(frame, (vx, y1 + 6), 5, siren_color, -1)
            else:
                cv2.rectangle(frame, (x1, y1), (x2, y2), v.color, -1, cv2.LINE_AA)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (30, 30, 30), 1, cv2.LINE_AA)
                glass_y1 = y1 + int(h * 0.22)
                glass_y2 = y1 + int(h * 0.40)
                cv2.rectangle(frame, (x1 + 3, glass_y1), (x2 - 3, glass_y2), (70, 75, 80), -1)
                cv2.circle(frame, (x1 + 4, y2 - 3), 2, (100, 255, 255), -1)
                cv2.circle(frame, (x2 - 4, y2 - 3), 2, (100, 255, 255), -1)

            if self.show_boxes:
                has_violation = len(v.violations) > 0
                box_color = (0, 220, 255) if v.is_emergency else ((40, 40, 255) if has_violation else (50, 230, 80))
                cv2.rectangle(frame, (x1 - 4, y1 - 4), (x2 + 4, y2 + 4), box_color, 2)
                
                label = f"{v.type.upper()} #{v.id}"
                if self.show_speeds:
                    label += f" | {v.speed_kmh:.0f} km/h"
                if v.is_emergency:
                    label = f"EMERGENCY | #{v.id}"
                
                (lw, lh), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.38, 1)
                cv2.rectangle(frame, (x1 - 4, y1 - 20), (x1 - 4 + lw + 8, y1 - 4), box_color, -1)
                cv2.putText(frame, label, (x1, y1 - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (0, 0, 0), 1, cv2.LINE_AA)

                if has_violation:
                    vio_label = f"! {v.violations[0].upper()}"
                    (vw, vh), _ = cv2.getTextSize(vio_label, cv2.FONT_HERSHEY_SIMPLEX, 0.36, 1)
                    cv2.rectangle(frame, (x1 - 4, y2 + 6), (x1 - 4 + vw + 8, y2 + 20), (30, 30, 220), -1)
                    cv2.putText(frame, vio_label, (x1, y2 + 17), cv2.FONT_HERSHEY_SIMPLEX, 0.36, (255, 255, 255), 1, cv2.LINE_AA)

        self._render_hud(frame, real_cam=False, target_count=len(self.vehicles), ped_count=len(self.pedestrians))
        return frame

    def _render_hud(self, frame: np.ndarray, real_cam: bool = False, target_count: int = 0, ped_count: int = 0):
        mode_str = "OPTICAL HARDWARE LINK" if real_cam else "SYNTHETIC SIMULATION"
        hud_title = f"{self.cam_id} [{self.area.upper()} : {self.cam_label.upper()}] - {mode_str}"
        cv2.putText(frame, hud_title, (14, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (220, 220, 220), 1, cv2.LINE_AA)
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(frame, f"REC: {timestamp} | 30.0 FPS | LIMIT: {int(self.speed_limit)} KM/H", (14, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.36, (0, 255, 140), 1, cv2.LINE_AA)

        # Right telemetry
        cv2.putText(frame, f"VEHICLES: {target_count:02d}", (self.width - 150, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (0, 230, 255), 1, cv2.LINE_AA)
        ped_color = (0, 240, 255) if ped_count > 0 else (160, 160, 160)
        cv2.putText(frame, f"PEDESTRIANS: {ped_count:02d}", (self.width - 150, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.38, ped_color, 1, cv2.LINE_AA)


    def generate_jpeg_stream(self):
        while True:
            frame = self.render_frame()
            ret, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
            if not ret:
                time.sleep(0.03)
                continue
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            time.sleep(0.033)


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
            cam_source = CAMERA_SOURCE if cfg["id"] == "CAM-01" else None
            self.cameras[cfg["id"]] = TrafficVisionEngine(
                cam_id=cfg["id"],
                cam_label=cfg["label"],
                area=cfg["area"],
                speed_limit=cfg["limit"],
                source=cam_source
            )

    def get_camera(self, cam_id: str) -> TrafficVisionEngine:
        return self.cameras.get(cam_id, self.cameras["CAM-01"])

    def list_cameras(self) -> List[Dict[str, Any]]:
        result = []
        for cfg in CAMERA_PRESETS:
            cam = self.cameras[cfg["id"]]
            status = "HARDWARE ONLINE" if cam.is_real_camera else "ONLINE"
            result.append({
                "id": cfg["id"],
                "label": cfg["label"],
                "area": cfg["area"],
                "limit": cfg["limit"],
                "status": status,
                "resolution": f"{cam.width}x{cam.height}",
                "active_targets": len(cam.vehicles),
                "active_pedestrians": len(cam.pedestrians),
                "fps": 30.0
            })
        return result

    def set_red_light_all(self, active: bool):
        for cam in self.cameras.values():
            cam.set_red_light(active)

    def trigger_emergency_all(self):
        for cam in self.cameras.values():
            cam.trigger_emergency_vehicle()

    def trigger_pedestrian_all(self):
        for cam in self.cameras.values():
            cam.trigger_pedestrian_crossing()

    def get_all_violations(self) -> List[Dict[str, Any]]:
        all_v = []
        for cam in self.cameras.values():
            all_v.extend(cam.recent_violations)
        all_v.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return all_v[:60]


# Global instance
camera_manager = MultiCameraManager()
