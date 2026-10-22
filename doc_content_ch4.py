# doc_content_ch4.py
# Chapter 4 comprehensive academic text and full Java source code walkthroughs for UrbanFlow AI

import os

JAVA_ROOT = r"c:\Traffic analytical system\java_system\src\com\urbanflow"

def read_java_file(rel_path):
    full_p = os.path.join(JAVA_ROOT, rel_path)
    if os.path.exists(full_p):
        with open(full_p, "r", encoding="utf-8") as f:
            return f.read()
    return "// File not found: " + rel_path

CH4_TITLE = "CHAPTER 4\nIMPLEMENTATION AND SOURCE CODE"

CH4_INTRO = [
    "This chapter presents the comprehensive technical implementation of the UrbanFlow AI platform. Developed natively in standard Java (OpenJDK 26 / Java SE), the system requires zero external runtime dependencies, third-party libraries, or heavyweight application servers. The entire platform, encompassing the 60 FPS hardware-accelerated microscopic physics engine, the actuated adaptive signal controller, the pedestrian safety interlock, the emergency preemption state machine, the synthetic CCTV vision engine, and the embedded HTTP REST server, is realized through clean, object-oriented Java architecture.",
    "The implementation emphasizes high computational throughput, deterministic execution, rock-solid thread safety, and minimal memory allocation. In accordance with production systems engineering principles, concurrent data structures (such as CopyOnWriteArrayList and AtomicBoolean) are deployed to prevent race conditions between the 60 Hz physics loop, the 60 Hz Java2D rendering thread, and the multi-threaded HTTP request executor pool.",
    "The following sections present the architecture, complete source code listings, and detailed technical walkthroughs across ten core functional modules."
]

CH4_MODULES = [
    {
        "id": "4.1",
        "title": "4.1 Implementation Overview and Technical Stack Configuration",
        "description": "The UrbanFlow AI software stack is constructed purely using the Java Platform Standard Edition (Java SE). Figure 4.1 summarizes the runtime environment parameters, compiler options, and thread concurrency boundaries.",
        "text": [
            "The platform leverages the modern features of the Java Virtual Machine (JVM). To achieve locked 60 FPS rendering without graphical micro-stuttering, the application executes with the Direct3D graphics pipeline enabled via the system property -Dsun.java2d.d3d=true. Double buffering is enforced across all Swing canvas components to eliminate rasterization flicker.",
            "Thread execution is divided into three asynchronous execution domains: (1) The Swing Event Dispatch Thread (EDT) managing user interface events, user interactions, and 60 Hz repaint timers; (2) The Microscopic Simulation Thread executing deterministic physics updates, IDM acceleration evaluations, and collision checking at 16.67 millisecond intervals; and (3) The Embedded HTTP Server Thread Pool (Executors.newFixedThreadPool(4)) handling incoming REST API queries independently without blocking the physics or rendering pipelines."
        ]
    },
    {
        "id": "4.2",
        "title": "4.2 Module 1: Vehicle, Pedestrian and Signal Core Models",
        "description": "Encapsulates fundamental domain entities in the com.urbanflow.model package. Governs vehicle kinematics, bounding geometries, pedestrian crossing states, signal phases, and violation records.",
        "file": "model/Vehicle.java",
        "walkthrough": [
            "Technical Walkthrough of Vehicle.java:",
            "- Kinematic State Representation: Each Vehicle instance maintains high-precision floating-point coordinates (x, y), velocity, target free-flow speed, acceleration, and heading angle. Vehicle categories (CAR, BUS, TRUCK, AMBULANCE) are parameterized with distinct physical lengths (Car: 40px, Bus: 75px, Truck: 65px, Ambulance: 45px), maximum acceleration bounds (1.5 to 2.5 m/s^2), and braking limits.",
            "- Intelligent Driver Model (IDM) Implementation: The computeIdmAcceleration() method implements Treiber's IDM equations. Under free-flow conditions, the vehicle accelerates smoothly toward targetSpeed. When approaching a lead vehicle or an intersection stop line, the method calculates the dynamic desired gap s* and evaluates interaction braking deceleration.",
            "- Thread Safety & State Encapsulation: All mutating methods are synchronized or operate on atomic primitives, ensuring that physics updates and visual rendering operations can inspect vehicle states concurrently without race conditions.",
            "- Bounding Box Geometry: The getBounds() method constructs an AffineTransform-rotated Rectangle2D corresponding to the vehicle's spatial footprint, utilized by the CCTV vision engine and collision detection routines."
        ]
    },
    {
        "id": "4.3",
        "title": "4.3 Module 2: Microscopic Physics Simulation Engine",
        "description": "Implements the core 60 FPS physics loop in com.urbanflow.engine.TrafficSimulator. Manages stochastic vehicle generation, multi-lane queue tracking, collision-avoidance car-following, and pedestrian crossing dynamics.",
        "file": "engine/TrafficSimulator.java",
        "walkthrough": [
            "Technical Walkthrough of TrafficSimulator.java:",
            "- Autonomous 60 Hz Physics Loop: The simulator operates a dedicated javax.swing.Timer triggering every 16 milliseconds. Each tick updates vehicle positions, evaluates signal indications, and checks pedestrian positions.",
            "- Stochastic Poisson Arrival Generation: The spawnVehicles() method models stochastic traffic arrivals across four approaches (North, South, East, West). Arrival rates are parameterized to simulate asymmetric morning rush hours or balanced off-peak traffic.",
            "- Multi-Lane Queue Tracking: The engine tracks queue counts (queueNS and queueEW) by scanning vehicles located within 150 meters of the stop line with velocities below 1.0 m/s. These metrics are fed directly into the adaptive controller.",
            "- Crosswalk Stop-Line Barrier Enforcement: When pedestrians are actively crossing, the simulation engine inserts a virtual stopping barrier at the stop line. Vehicles approaching the crosswalk treat this barrier as a stationary obstacle, decelerating to a complete halt."
        ]
    },
    {
        "id": "4.4",
        "title": "4.4 Module 3: Actuated Adaptive Signal Controller",
        "description": "Implements the dynamic signal optimization algorithms in com.urbanflow.engine.AdaptiveSignalController. Computes green phase splits from real-time queue ratios and manages phase transitions.",
        "file": "engine/AdaptiveSignalController.java",
        "walkthrough": [
            "Technical Walkthrough of AdaptiveSignalController.java:",
            "- Queue Ratio Calculation: Evaluates real-time queue lengths across competing approaches to compute dynamic green phase allocations between G_min (10.0 s) and G_max (45.0 s).",
            "- Early Phase Termination: If the active corridor's queue is completely cleared while opposing queues exceed threshold limits, the controller truncates the green phase early, avoiding unproductive green time.",
            "- Yellow Clearance and All-Red Safety Intervals: Enforces a strict 3.0-second yellow transition and a 1.5-second all-red clearance interval to ensure intersection clearing before conflicting movements are released."
        ]
    },
    {
        "id": "4.5",
        "title": "4.5 Module 4: Pedestrian Safety Interlock and All-Red Hold Enforcement",
        "description": "Governs the deterministic pedestrian crosswalk safety protocol within TrafficSimulator and IntersectionCanvas. Guarantees zero vehicular-pedestrian right-of-way conflicts.",
        "file": "model/Pedestrian.java",
        "walkthrough": [
            "Technical Walkthrough of Pedestrian Safety Interlock:",
            "- Zebra Crossing Geometry: The crosswalk is modeled as a 30-pixel-wide corridor spanning the roadway approach. Pedestrian agents are initialized at the sidewalk curb and traverse laterally at 1.2 m/s.",
            "- Immediate Vehicular Hold: As soon as a pedestrian steps onto the crosswalk (isCrossing = true), the controller flags pedestrianCrossingActive = true, triggering an immediate All-Red vehicular hold.",
            "- Mandatory Stop-Line Halting: Vehicles approaching the crosswalk detect the pedestrian hold via the IDM interaction term and come to a complete standstill before the white stop line. Vehicular movement is prohibited until the pedestrian completely clears the roadway."
        ]
    },
    {
        "id": "4.6",
        "title": "4.6 Module 5: Emergency Vehicle Preemption Subsystem",
        "description": "Implements high-priority ambulance preemption, rapid yellow clearance transitions, and green wave corridor locking in AdaptiveSignalController.",
        "file": "model/SignalPhase.java",
        "walkthrough": [
            "Technical Walkthrough of Emergency Preemption:",
            "- Preemption Trigger: Scans approaching vehicles for isEmergency = true. When detected within 200 meters of the stop line, preemption mode is engaged immediately.",
            "- Priority Green Wave Corridor: Forces opposing phases to yellow (3.0 s) and then red, locking solid green on the ambulance's corridor until the first responder departs the intersection.",
            "- Metric Logging: Measures ambulance approach delay, transit duration, and departure timestamp for operational compliance audits."
        ]
    },
    {
        "id": "4.7",
        "title": "4.7 Module 6: Synthetic CCTV Optical Vision Engine",
        "description": "Synthesizes high-angle roadside CCTV camera perception in com.urbanflow.engine.VisionEngine. Computes bounding boxes, Doppler speed vectors, and flags electronic violations.",
        "file": "engine/VisionEngine.java",
        "walkthrough": [
            "Technical Walkthrough of VisionEngine.java:",
            "- Optical Tracking Pipeline: Generates synthetic 2D bounding boxes with classification labels, tracking IDs, and detection confidence scores (94% to 99%).",
            "- Doppler Speed Radar Estimation: Tracks displacement vectors (dx, dy) over discrete time intervals dt to calculate instantaneous vehicle speed in km/h.",
            "- Automated Violation Flagging: Automatically generates Violation records upon detecting speeding (>50 km/h), red light running, or crosswalk right-of-way failure."
        ]
    },
    {
        "id": "4.8",
        "title": "4.8 Module 7: Embedded Multi-Threaded HTTP REST Server",
        "description": "Hosts the zero-dependency REST API telemetry server in com.urbanflow.server.JavaTrafficServer using com.sun.net.httpserver.HttpServer.",
        "file": "server/JavaTrafficServer.java",
        "walkthrough": [
            "Technical Walkthrough of JavaTrafficServer.java:",
            "- Zero-Dependency Architecture: Utilizes Java's built-in HTTP server, eliminating heavyweight dependencies like Spring Boot or Tomcat.",
            "- Endpoints & Serialization: Exposes /api/metrics, /api/violations, and /api/system, serializing real-time telemetry into clean JSON structures.",
            "- High-Throughput Concurrency: Configures a multi-threaded ExecutorService pool with CORS headers, enabling web dashboards to poll metrics with sub-millisecond latency."
        ]
    },
    {
        "id": "4.9",
        "title": "4.9 Module 8: Hardware-Accelerated Java2D Simulation Canvas",
        "description": "Implements GPU-accelerated rendering in com.urbanflow.ui.IntersectionCanvas. Renders roadways, vehicle polygons, headlight cones, and braking light halos at 60 FPS.",
        "file": "ui/IntersectionCanvas.java",
        "walkthrough": [
            "Technical Walkthrough of IntersectionCanvas.java:",
            "- Direct3D Hardware Acceleration: Utilizes sun.java2d.d3d=true to rasterize anti-aliased curves and rotated vehicle shapes on the GPU.",
            "- Visual Realism: Features dynamic vehicle headlights with radial gradient illumination, red braking halos, directional turn signals, and animated zebra crosswalks.",
            "- Double Buffering: Guarantees flicker-free 60 FPS animation through custom offscreen buffering."
        ]
    },
    {
        "id": "4.10",
        "title": "4.10 Module 9: Electronic Violation Ledger and E-Challan Panel",
        "description": "Implements the real-time violation monitoring panel in com.urbanflow.ui.ViolationLedgerPanel. Displays scrollable tabular infraction records with status badges.",
        "file": "ui/ViolationLedgerPanel.java",
        "walkthrough": [
            "Technical Walkthrough of ViolationLedgerPanel.java:",
            "- Tabular Audit Ledger: Utilizes a customized JTable with alternating row colors, displaying violation ID, timestamp, license plate, vehicle category, speed, offense, and fine.",
            "- Real-Time Event Dispatching: Appends new violation records dynamically from the VisionEngine, updating summary statistics and total assessed fines.",
            "- Export Capabilities: Provides one-click CSV export functionality for municipal traffic enforcement integration."
        ]
    },
    {
        "id": "4.11",
        "title": "4.11 Module 10: Master Application Orchestrator and Main Entry Point",
        "description": "Initializes system components, registers shutdown hooks, and launches the desktop command center in com.urbanflow.UrbanFlowMain and UrbanFlowWindow.",
        "file": "UrbanFlowMain.java",
        "walkthrough": [
            "Technical Walkthrough of UrbanFlowMain.java & UrbanFlowWindow.java:",
            "- Master Lifecycle Management: Configures JVM system properties, initializes the simulation engine, launches the embedded HTTP server, and starts the 60 Hz physics loop.",
            "- Command Center GUI Assembly: Assembles the multi-pane split layout combining the IntersectionCanvas, the CctvCanvas HUD, the ViolationLedgerPanel, and the ControlToolbar.",
            "- Graceful Shutdown Hooks: Registers JVM runtime shutdown hooks to cleanly terminate the HTTP server and background threads upon application exit."
        ]
    }
]
