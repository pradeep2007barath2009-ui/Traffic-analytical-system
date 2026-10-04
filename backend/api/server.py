"""
UrbanFlow AI - FastAPI Server & Multi-Camera Telemetry Hub
Coordinates Computer Vision pipelines across city areas, Adaptive Signals, Pedestrian Safety, and Web Dashboard.
"""

import asyncio
import json
import time
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from backend.engine.vision import camera_manager, CAMERA_PRESETS
from backend.engine.simulator import MultiJunctionNetwork, JUNCTION_CONFIGS

app = FastAPI(title="UrbanFlow AI - Multi-Camera Traffic Operations API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sim_engine = MultiJunctionNetwork()

class SettingsPayload(BaseModel):
    mode: Optional[str] = None
    density: Optional[str] = None
    cam: Optional[str] = None
    show_boxes: Optional[bool] = None
    show_speeds: Optional[bool] = None
    show_trajectories: Optional[bool] = None
    show_lanes: Optional[bool] = None

class PreemptPayload(BaseModel):
    direction: str = "NS"
    reason: str = "Ambulance Priority Dispatch"
    cam: Optional[str] = None

class PedestrianPayload(BaseModel):
    approach: str = "N"
    cam: Optional[str] = None

connected_clients: List[WebSocket] = []

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(telemetry_broadcaster())

async def telemetry_broadcaster():
    while True:
        try:
            sim_state = sim_engine.tick()

            ns_light = sim_state["signals"]["ns_light"]
            camera_manager.set_red_light_all(ns_light == "RED")

            cameras_list = camera_manager.list_cameras()
            all_violations = camera_manager.get_all_violations()

            payload = {
                "timestamp": time.time(),
                "signals": sim_state["signals"],
                "metrics": sim_state["metrics"],
                "vehicles": sim_state["vehicles"],
                "pedestrians": sim_state.get("pedestrians", []),
                "crosswalk_active": sim_state.get("crosswalk_active", False),
                "junctions": sim_state.get("junctions", {}),
                "cameras": cameras_list,
                "violations_count": len(all_violations),
                "latest_violation": all_violations[0] if all_violations else None
            }

            disconnected = []
            for client in connected_clients:
                try:
                    await client.send_text(json.dumps(payload))
                except Exception:
                    disconnected.append(client)

            for dead_client in disconnected:
                if dead_client in connected_clients:
                    connected_clients.remove(dead_client)

        except Exception:
            pass

        await asyncio.sleep(0.2)

@app.get("/api/health")
def health_check():
    return {"status": "online", "system": "UrbanFlow AI", "version": "1.0.0"}

@app.get("/api/cameras")
def get_cameras():
    return {
        "cameras": camera_manager.list_cameras(),
        "areas": ["North Expressway", "Downtown Commercial", "Tech Park Corridor", "Hospital Green Route"]
    }

@app.get("/api/metrics")
def get_metrics():
    sim_state = sim_engine.tick()
    all_violations = camera_manager.get_all_violations()
    return {
        "metrics": sim_state["metrics"],
        "signals": sim_state["signals"],
        "junctions": sim_state.get("junctions", {}),
        "cameras": camera_manager.list_cameras(),
        "pedestrians": sim_state.get("pedestrians", []),
        "crosswalk_active": sim_state.get("crosswalk_active", False),
        "active_violations": len(all_violations)
    }

@app.get("/api/violations")
def get_violations():
    return {"violations": camera_manager.get_all_violations()}

@app.post("/api/corridor/preempt")
def trigger_preemption(payload: PreemptPayload):
    approach = "N" if payload.direction == "NS" else "E"
    sim_engine.inject_emergency_vehicle(approach=approach, cam_id=payload.cam)
    camera_manager.trigger_emergency_all()
    return {
        "status": "GREEN_CORRIDOR_ACTIVE",
        "direction": payload.direction,
        "cam": payload.cam or "ALL",
        "message": f"Emergency green corridor engaged for {payload.direction} route."
    }

@app.post("/api/pedestrian/crossing")
def trigger_pedestrian_crossing(payload: PedestrianPayload):
    sim_engine.trigger_pedestrian_crossing(approach=payload.approach, cam_id=payload.cam)
    camera_manager.trigger_pedestrian_all()
    return {
        "status": "CROSSWALK_ACTUATED",
        "approach": payload.approach,
        "cam": payload.cam or "ALL",
        "message": f"Pedestrian crossing active on approach {payload.approach}."
    }

@app.post("/api/settings")
def update_settings(settings: SettingsPayload):
    if settings.mode:
        sim_engine.set_controller_mode(settings.mode, cam_id=settings.cam)
    if settings.density:
        sim_engine.set_density(settings.density, cam_id=settings.cam)

    target_cams = [camera_manager.get_camera(settings.cam)] if settings.cam else list(camera_manager.cameras.values())
    for cam in target_cams:
        if settings.show_boxes is not None:
            cam.show_boxes = settings.show_boxes
        if settings.show_speeds is not None:
            cam.show_speeds = settings.show_speeds
        if settings.show_trajectories is not None:
            cam.show_trajectories = settings.show_trajectories
        if settings.show_lanes is not None:
            cam.show_lanes = settings.show_lanes

    return {
        "status": "success",
        "mode": sim_engine.signal_controller.mode,
        "density": sim_engine.traffic_density
    }

@app.get("/api/analytics/historical")
def get_historical_analytics():
    return {
        "hourly_volume": [
            {"hour": "06:00", "baseline_fixed": 420, "adaptive_ai": 540, "congestion": 35},
            {"hour": "07:00", "baseline_fixed": 850, "adaptive_ai": 1180, "congestion": 68},
            {"hour": "08:00", "baseline_fixed": 1240, "adaptive_ai": 1720, "congestion": 92},
            {"hour": "09:00", "baseline_fixed": 1410, "adaptive_ai": 1890, "congestion": 88},
            {"hour": "10:00", "baseline_fixed": 980, "adaptive_ai": 1340, "congestion": 55},
            {"hour": "11:00", "baseline_fixed": 760, "adaptive_ai": 990, "congestion": 42},
            {"hour": "12:00", "baseline_fixed": 910, "adaptive_ai": 1210, "congestion": 50},
            {"hour": "13:00", "baseline_fixed": 840, "adaptive_ai": 1130, "congestion": 46},
            {"hour": "14:00", "baseline_fixed": 790, "adaptive_ai": 1050, "congestion": 44},
            {"hour": "15:00", "baseline_fixed": 950, "adaptive_ai": 1280, "congestion": 56},
            {"hour": "16:00", "baseline_fixed": 1180, "adaptive_ai": 1620, "congestion": 78},
            {"hour": "17:00", "baseline_fixed": 1520, "adaptive_ai": 2040, "congestion": 96},
            {"hour": "18:00", "baseline_fixed": 1460, "adaptive_ai": 1980, "congestion": 94},
            {"hour": "19:00", "baseline_fixed": 1120, "adaptive_ai": 1490, "congestion": 65},
            {"hour": "20:00", "baseline_fixed": 690, "adaptive_ai": 890, "congestion": 38}
        ],
        "vehicle_breakdown": [
            {"name": "Passenger Cars", "value": 60, "color": "#3B82F6"},
            {"name": "Motorcycles / Scooters", "value": 18, "color": "#10B981"},
            {"name": "Pedestrians (Crosswalk)", "value": 10, "color": "#06B6D4"},
            {"name": "Buses / Transit", "value": 6, "color": "#F59E0B"},
            {"name": "Commercial Trucks", "value": 4, "color": "#8B5CF6"},
            {"name": "Emergency Units", "value": 2, "color": "#EF4444"}
        ],
        "wait_time_comparison": [
            {"approach": "North (Highway)", "fixed_wait_sec": 24.2, "adaptive_wait_sec": 14.1, "reduction_pct": 41.7},
            {"approach": "South (Commercial)", "fixed_wait_sec": 22.8, "adaptive_wait_sec": 13.6, "reduction_pct": 40.3},
            {"approach": "East (Avenue 4)", "fixed_wait_sec": 18.5, "adaptive_wait_sec": 12.0, "reduction_pct": 35.1},
            {"approach": "West (Tech Park)", "fixed_wait_sec": 19.1, "adaptive_wait_sec": 11.8, "reduction_pct": 38.2}
        ]
    }

@app.get("/api/video/feed")
def video_feed(cam: str = Query("CAM-01")):
    engine = camera_manager.get_camera(cam)
    return StreamingResponse(
        engine.generate_jpeg_stream(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            cmd = json.loads(data)
            if cmd.get("action") == "preempt":
                sim_engine.inject_emergency_vehicle(approach=cmd.get("direction", "N"))
                camera_manager.trigger_emergency_all()
            elif cmd.get("action") == "pedestrian":
                sim_engine.trigger_pedestrian_crossing(approach=cmd.get("approach", "N"))
                camera_manager.trigger_pedestrian_all()
    except WebSocketDisconnect:
        if websocket in connected_clients:
            connected_clients.remove(websocket)
    except Exception:
        if websocket in connected_clients:
            connected_clients.remove(websocket)
