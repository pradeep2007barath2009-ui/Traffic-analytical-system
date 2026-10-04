# 🚦 UrbanFlow AI - Unified Smart City Traffic Analytical System

A production-grade, end-to-end intelligent urban traffic management and analytical platform combining **Computer Vision**, **Adaptive Traffic Signal Control with Emergency Green Corridor Preemption**, and a **Real-Time Traffic Operations Center (TOC) Dashboard**.

🌐 **Live Vercel Deployment**: [https://frontend-lilac-alpha-77.vercel.app](https://frontend-lilac-alpha-77.vercel.app)

---

## 🌟 Key Highlights & Features

### 1. 👁️ AI Computer Vision Video Pipeline
- **Real-Time Vehicle Detection & Tracking**: Identifies and tracks cars, motorcycles, trucks, buses, and emergency vehicles.
- **Speed & Trajectory Estimation**: Computes instant vehicle speed (km/h) based on displacement and visual trajectory tracking.
- **Automated Infraction Logging**:
  - Overspeeding detection (> 60 km/h in urban 50 zone).
  - Red Light & Stop-line intrusion.
  - Generates instant electronic citation records (E-Challan).
- **Interactive Layer Toggles**: Operators can toggle Bounding Boxes, Speed Tags, Trajectory Trails, and Lane Dividers in real-time.
- **Accessibility & Inclusivity**:
  - **Colorblind-Friendly Signal Mode (Deuteranopia/Protanopia)**: Displays geometric shapes (🛑 Stop / ✕, ⚠️ Caution / !, ➔ Clear / Go) and high-contrast labels.
  - **Voice Audio Announcer (Web Speech TTS)**: Spoken voice notifications for emergency green corridors, mode switches, and violations.
  - **Keyboard Navigation & Hotkeys**: Hands-free control with keys (`A`/`Space` for ambulance, `M` for mode, `1`/`2`/`3` for demand, `C` for colorblind, `V` for voice, `?` for help).
  - **Text Scaling**: Scalable typography (Normal, A+, A++).
  - **Reduced Motion (Calm Mode)**: Smooth animations without aggressive strobes for vestibular sensitivity.
  - **1-Click E-Challan CSV Export**: Instant export of all violation tickets into CSV for auditing.
  - **Local Network / Mobile Access**: Exposes `--host` so mobile phones and tablets can access the dashboard over Wi-Fi.

### 2. ⚡ Adaptive Signal Control & Emergency Green Corridor
- **Queue-Sensitive Webster Phase Optimization**: Replaces rigid, pre-timed 30s cycles with a dynamic controller that adapts green intervals (10s to 50s) based on live queue ratios.
- **🚨 Emergency Green Corridor Preemption**:
  - Automatically or manually preempts traffic signals when an ambulance or fire truck approaches.
  - Rapidly shifts opposing directions to yellow/red and locks the corridor green until the emergency vehicle clears the junction.
  - Logs time saved for first responders.
- **Emissions & Delay Analytics**: Real-time tracking of wait time reduction (up to 40%) and idle carbon footprint saved ($kg\ CO_2$).

### 3. 🖥️ Full-Stack Traffic Operations Center (TOC) Dashboard
- **Live CCTV Video Stream**: High-performance MJPEG stream with AI telemetry overlays.
- **Interactive 4-Way Junction Visualizer**: Top-down 2D canvas simulation displaying signal heads, countdown timers, vehicle movement, and illuminated green corridors.
- **Telemetry Metric Cards**: Active Targets, Corridor Speed, Congestion Index Gauge, Wait Reduction %, CO2 Saved, and Green Corridors Cleared.
- **Scenario Dock**: Toggle between `Adaptive AI` and `Fixed 30s Baseline`, change traffic influx (`Low`, `Normal`, `Rush Hour`), and inject test ambulances.
- **Historical Mobility Analytics**: Hourly vehicle volume comparisons, vehicle classification share, and approach delay benchmarks.

---

## 🏗️ System Architecture

```
                    ┌────────────────────────────────────────┐
                    │      CCTV Camera / Video Influx        │
                    └───────────────────┬────────────────────┘
                                        ▼
                    ┌────────────────────────────────────────┐
                    │       Traffic Vision Engine            │
                    │   - Detection & Classification         │
                    │   - Speed Estimation & Trajectories    │
                    │   - Violation Flagging (E-Challan)     │
                    └───────────────────┬────────────────────┘
                                        ▼
┌──────────────────────┐    ┌────────────────────────┐    ┌──────────────────────┐
│  4-Way Intersection  │◄──►│ Adaptive Signal Engine │◄──►│ Emergency Green      │
│  Micro-Simulator     │    │ - Dynamic Phase Split  │    │ Corridor Preemption  │
└──────────┬───────────┘    └───────────┬────────────┘    └──────────────────────┘
           │                            │
           └──────────────────┬─────────┘
                              ▼
        ┌───────────────────────────────────────────┐
        │        FastAPI & WebSockets Hub           │
        │   - REST Endpoints (/api/metrics, etc.)   │
        │   - WebSocket Telemetry Stream (5 Hz)     │
        │   - MJPEG Video Stream (/api/video/feed)  │
        └─────────────────────┬─────────────────────┘
                              ▼
        ┌───────────────────────────────────────────┐
        │  React + Tailwind CSS TOC Web Dashboard   │
        │   - Live Video AI HUD & Layer Toggles     │
        │   - 2D Canvas Intersection Visualizer     │
        │   - Scenario Dock & Infraction Ledger     │
        └───────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, FastAPI, WebSockets, OpenCV, NumPy, Pydantic, Uvicorn
- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React Icons
- **Simulation**: Discrete-event microscopic queue and kinematic vehicle model

---

## 🚀 Quick Start Guide

### 1. Launch Everything in One Click (Windows)
Double-click `run_all.bat` or run:
```cmd
run_all.bat
```
This starts both backend and frontend servers and opens `http://localhost:5173` in your browser.

---

### 2. Manual Startup (Step-by-Step)

#### Step 1: Start Backend API & Computer Vision Stream
```cmd
python backend/main.py
```
- API Server: `http://localhost:8000`
- API Docs (Swagger): `http://localhost:8000/docs`
- Video Stream: `http://localhost:8000/api/video/feed`

#### Step 2: Start Frontend Web Dashboard
```cmd
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📡 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/video/feed` | `GET` | Multipart MJPEG real-time video stream with AI overlays |
| `/api/metrics` | `GET` | Current telemetry (active vehicles, avg speed, congestion index) |
| `/api/violations` | `GET` | List of detected traffic infractions and e-challan tickets |
| `/api/corridor/preempt` | `POST` | Injects emergency vehicle and activates Green Corridor |
| `/api/settings` | `POST` | Toggles controller mode (`ADAPTIVE` vs `FIXED`), density, and overlays |
| `/api/analytics/historical` | `GET` | Hourly volume benchmarks, class share, and wait-time comparisons |
| `/ws/telemetry` | `WS` | Real-time 5 Hz WebSocket telemetry stream |

---

## 🧪 Demonstration Scenarios

1. **Compare Adaptive vs Fixed Mode**:
   - In the **Scenario Dock**, toggle between **Adaptive AI Controller** and **Fixed 30s Baseline**.
   - Observe how the **Wait Reduction %** and **CO2 Prevented** counters update dynamically.
2. **Simulate Heavy Rush Hour**:
   - Select **Rush Hour** under Traffic Demand.
   - Watch the queue build up on North-South highway and how the Adaptive Controller extends green time to prevent traffic gridlock.
3. **Test Emergency Green Corridor**:
   - Click **🚨 Inject Ambulance & Preempt Corridor**.
   - Notice the emergency ambulance entering with flashing sirens.
   - The opposing light immediately turns yellow then red; the corridor locks green with an emergency strobe banner until the vehicle clears the intersection.
