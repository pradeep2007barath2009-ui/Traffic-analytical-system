# doc_content_ch3.py
# Chapter 3 comprehensive academic text and table definitions for UrbanFlow AI

CH3_TITLE = "CHAPTER 3\nSYSTEM DESIGN AND ARCHITECTURAL SPECIFICATION"

CH3_SECTIONS = [
    {
        "heading": "3.1 High-Level System Architecture and Component Decomposition",
        "paragraphs": [
            "UrbanFlow AI is architected as an edge-native, real-time cyber-physical traffic control and monitoring system. The platform employs a decoupled, modular, layer-based software architecture designed for high throughput, thread safety, and deterministic real-time responsiveness. The architecture is decomposed into four primary functional tiers: the Microscopic Physics Simulation Tier, the Actuated Control & Safety Interlock Tier, the Optical CCTV Perception & Enforcement Tier, and the Presentation & Telemetry Streaming Tier.",
            "Figure 3.1 illustrates the comprehensive end-to-end system architecture of UrbanFlow AI, depicting the bidirectional communication flows and data pipelines between physical intersection entities, algorithmic control modules, visual renderers, and external telemetry consumers.",
            "[FIGURE_3_1_PLACEHOLDER]",
            "At the foundational tier, the Microscopic Physics Simulation Engine executes an autonomous discrete-event simulation loop at 60 Hz. The engine continuously tracks the kinematic state vectors (position, velocity, acceleration, lane assignment, and target heading) of all vehicular and pedestrian entities within the intersection perimeter. The engine updates vehicle positions using the Intelligent Driver Model (IDM) equations, applying car-following acceleration, headway maintenance, and collision-avoidance braking relative to leading vehicles, stop lines, and signal phase indications.",
            "The Actuated Control & Safety Interlock Tier sits directly above the simulation engine, operating as the supervisory decision-making nucleus. This tier continuously polls queue lengths, approach velocities, pedestrian occupancy, and emergency siren signals across all conflicting approaches. The Adaptive Signal Controller executes dynamic phase optimization algorithms to calculate phase splits, while the Pedestrian Safety Interlock and Emergency Vehicle Preemption modules maintain supreme authority to override standard cycle transitions to enforce immediate safety holds or green wave priority corridors.",
            "The Optical CCTV Perception & Enforcement Tier processes raw spatial coordinates to synthesize an edge-native video analytics pipeline. It projects dynamic 2D bounding boxes, estimates instantaneous vehicular velocities using spatial displacement vectors, checks stop-line boundary violations against signal phase states, and generates immutable electronic violation records (E-Challans) upon detecting infractions.",
            "Finally, the Presentation & Telemetry Streaming Tier comprises two parallel interfaces: a hardware-accelerated Java2D graphical user interface rendering real-time simulation graphics and CCTV heads-up displays (HUD) at a locked 60 FPS, and an embedded high-performance HTTP REST server streaming real-time JSON telemetry to municipal operations dashboards."
        ]
    },
    {
        "heading": "3.2 Detailed Module Specification",
        "paragraphs": [
            "The UrbanFlow AI software system is partitioned into eight specialized modules, each encapsulated with clear interface boundaries and strict separation of concerns:",
            "(1) Vehicle & Entity Modeling Subsystem (com.urbanflow.model): Encapsulates core domain entities, including Vehicle, Pedestrian, SignalPhase, TrafficMetrics, and Violation. These classes define immutable entity identifiers, spatial bounding geometries, kinematic parameters, and operational states.",
            "(2) Microscopic Traffic Simulation Engine (com.urbanflow.engine.TrafficSimulator): Manages the global simulation clock, generates stochastic vehicle arrivals across four directional corridors (North, South, East, West), evaluates lane queuing dynamics, and advances physical movement vectors at a fixed 16.67 millisecond timestep (60 Hz).",
            "(3) Actuated Adaptive Signal Controller (com.urbanflow.engine.AdaptiveSignalController): Evaluates real-time vehicular queue ratios across competing corridors, dynamically adjusts green phase splits between calibrated bounds, manages yellow clearance intervals, and handles cycle transitions.",
            "(4) Pedestrian Safety Interlock Subsystem: Monitors pedestrian positions along crosswalk corridors, evaluates zebra crossing occupancy, triggers immediate All-Red vehicular holds, and enforces mandatory vehicular halting at stop lines until pedestrians fully exit the roadway.",
            "(5) Emergency Vehicle Preemption Subsystem: Detects priority emergency ambulances on approach vectors, calculates safe clearance intervals for active traffic, transitions conflicting phases to red, and locks an uninterrupted green wave corridor until the ambulance departs the intersection.",
            "(6) Optical CCTV Synthetic Perception Engine (com.urbanflow.engine.VisionEngine): Simulates high-angle intersection surveillance cameras, generates object detection bounding boxes, computes Doppler speed vectors, and flags electronic traffic infractions.",
            "(7) Embedded HTTP Telemetry Server (com.urbanflow.server.JavaTrafficServer): Hosts a zero-dependency REST API service on port 8080 using com.sun.net.httpserver, delivering real-time metrics, queue statistics, and violation ledgers formatted in JSON.",
            "(8) Operations Command Center GUI (com.urbanflow.ui): Provides a comprehensive desktop monitoring dashboard featuring hardware-accelerated Java2D intersection visualization, CCTV HUD overlays, real-time violation ledgers, and interactive simulation controls."
        ]
    },
    {
        "heading": "3.3 Dynamic Signal Actuation and Queue Estimation Algorithms",
        "paragraphs": [
            "Conventional fixed-time controllers allocate a constant green duration G_fixed (typically 30 seconds) to each signal phase regardless of actual demand. UrbanFlow AI introduces an actuated adaptive control algorithm that computes dynamic green allocations based on continuous real-time queue ratios.",
            "Let Q_NS(t) denote the total number of queued vehicles on the North-South corridor at time t, and Q_EW(t) denote the total number of queued vehicles on the East-West corridor at time t. A vehicle is classified as queued if its instantaneous velocity v satisfies v < v_threshold (where v_threshold = 1.0 m/s) and its distance to the stop line d_stop satisfies d_stop < d_detection (where d_detection = 150 meters).",
            "The queue demand ratio R_NS for the North-South corridor is defined as:",
            "R_NS = Q_NS(t) / [ Q_NS(t) + Q_EW(t) + epsilon ]",
            "Where epsilon is a negligible constant (0.001) preventing division-by-zero when the intersection is completely empty. The ideal target green allocation G_target for the North-South phase is formulated as:",
            "G_target = G_min + R_NS * (G_max - G_min)",
            "To maintain vehicular safety, driver expectations, and prevent arterial starvation, the algorithm enforces strict mathematical boundary clamping:",
            "G_allocated = max( G_min, min( G_max, G_target ) )",
            "Where:",
            "- G_min: Minimum green interval duration (calibrated to 10.0 seconds), guaranteeing sufficient time for queued vehicles to react and dissipate without short-cycling.",
            "- G_max: Maximum green interval duration (calibrated to 45.0 seconds), preventing excessive delay accumulation on opposing corridors.",
            "- Y_clearance: Fixed yellow clearance transition interval (calibrated to 3.0 seconds), providing safe stopping distance for approaching vehicles.",
            "- R_allred: All-Red clearance interval (calibrated to 1.5 seconds under standard transitions, or extended dynamically under pedestrian holds), clearing the intersection box before releasing conflicting traffic.",
            "When the elapsed green time t_elapsed reaches G_allocated and no queue extension criteria are met, the controller initiates a phase transition. If real-time queue sensors detect that the active corridor has completely cleared while the opposing corridor possesses a growing queue, the controller executes early phase termination, immediately transitioning through yellow clearance and eliminating unproductive green waste."
        ]
    },
    {
        "heading": "3.4 Pedestrian Crossing Safety Interlock & Actuation Protocol",
        "paragraphs": [
            "Ensuring absolute pedestrian safety requires a deterministic, fail-safe actuation protocol that eliminates open-loop timing vulnerabilities. Figure 3.2 illustrates the complete state transition sequence and logic flowchart of the UrbanFlow AI Pedestrian Safety Interlock.",
            "[FIGURE_3_2_PLACEHOLDER]",
            "The pedestrian safety protocol operates through five sequential operational phases:",
            "(1) Crossing Detection and Intent Recognition: When a pedestrian enters the designated zebra crosswalk perimeter (defined spatially along the East-West and North-South roadway boundaries), the safety interlock detects presence via spatial coordinate monitoring. The pedestrian state is flagged as ACTIVE_CROSSING.",
            "(2) Vehicular Green Phase Suspension: If vehicular traffic on the crossing approach currently possesses a green signal, the adaptive controller immediately terminates green phase extensions and initiates an expedited yellow clearance transition (duration: 3.0 seconds).",
            "(3) Mandatory All-Red Safety Hold Activation: Upon conclusion of the yellow clearance interval, the controller transitions all conflicting vehicular signal heads to solid RED. The intersection enters a mandatory ALL_RED_PEDESTRIAN_HOLD state.",
            "(4) Dynamic Virtual Stop-Line Barrier Enforcement: In the simulation engine, an impassable virtual barrier is projected at the vehicular stop line. Approaching vehicles evaluate this barrier through the Intelligent Driver Model (IDM) as a stationary obstacle with zero velocity (v_lead = 0) located at distance d_stop. The IDM braking deceleration term [s*(v, delta_v) / s]^2 forces all approaching vehicles to decelerate smoothly and come to an absolute standstill prior to the white stop line.",
            "(5) Crosswalk Clearance Verification and Phase Recovery: The safety interlock continuously monitors the pedestrian's spatial coordinates x_ped(t) and y_ped(t). Only when the pedestrian's bounding geometry completely clears the opposing sidewalk curb (exiting the active roadway surface) does the safety hold disengage. Once cleared, the controller evaluates queued vehicular demand across all approaches and safely awards green right-of-way to the highest-priority vehicular phase."
        ]
    },
    {
        "heading": "3.5 Emergency Vehicle Preemption and Green Wave State Machine",
        "paragraphs": [
            "Urban emergency response vehicles, specifically ambulances, require rapid, unobstructed transit through signalized corridors. UrbanFlow AI implements a high-priority emergency preemption state machine that preempts standard signal cycles upon detecting an emergency vehicle.",
            "The emergency preemption workflow is governed by four distinct states:",
            "(1) Detection and Approach Verification: The system continuously scans approaching vehicles for the emergency vehicle attribute (isEmergency = true). An approaching ambulance is recognized when it enters the detection radius (200 meters from the intersection center).",
            "(2) Rapid Clearance Transition: If the conflicting corridor currently possesses a green signal, the controller immediately forces the active phase into a rapid yellow clearance state (Y_clearance = 3.0 seconds). All pedestrian crossing calls on conflicting corridors are suspended.",
            "(3) Priority Corridor Green Wave Locking: Once conflicting phases reach solid red, the controller immediately activates green signals exclusively for the ambulance's approach corridor. Simultaneously, the green phase clears all downstream queued vehicles sitting between the ambulance and the intersection, creating an unobstructed green wave corridor. The signal state is locked in PREEMPTION_HOLD, preventing any phase transitions while the ambulance is in transit.",
            "(4) Intersection Departure and Cycle Restoration: As the ambulance crosses the intersection centroid and passes the departure perimeter, the preemption lock is released. The controller logs total transit time and emergency clearance latency, transitioning through an all-red clearance interval before resuming normal adaptive signal optimization."
        ]
    },
    {
        "heading": "3.6 Synthetic CCTV Vision Pipeline and Violation Detection Logic",
        "paragraphs": [
            "UrbanFlow AI incorporates a synthetic optical CCTV computer vision pipeline that simulates an overhead mast-mounted intersection surveillance camera. The vision pipeline transforms physical simulation entities into visual surveillance telemetry rendered directly on an operations heads-up display (HUD).",
            "The vision pipeline executes three real-time processing tasks:",
            "(1) Perspective Projection and Bounding-Box Generation: For every vehicle within the camera's field of view, the vision engine calculates a 2D bounding box aligned with the camera perspective. The bounding box dimensions are dynamically scaled based on vehicle category (Car: 40x22 pixels, Bus: 75x26 pixels, Truck: 65x24 pixels, Ambulance: 45x22 pixels). The HUD renders an identification tag displaying vehicle ID, classification label, and detection confidence score (e.g., 'CAR #104 [98.4%]').",
            "(2) Kinematic Doppler Speed Radar Estimation: The vision engine computes instantaneous vehicle speed by tracking spatial pixel displacement over successive frames: v_est = (sqrt(dx^2 + dy^2) / dt) * scale_factor, where scale_factor converts pixel velocities into kilometers per hour (km/h). Estimated speeds are rendered above each bounding box. If v_est exceeds the municipal speed limit (50 km/h), the bounding box color transitions from green (#10B981) to amber (#F59E0B) or crimson (#EF4444).",
            "(3) Automated Electronic Violation Logging (E-Challan Engine): The system enforces three distinct traffic violation rules: Speeding Infractions (v_est > 50 km/h), Red-Light Jumping (vehicle crosses the stop line while the corresponding signal indicates red), and Failure to Yield to Pedestrians (vehicle advances into a crosswalk while a pedestrian is actively crossing). When a violation occurs, the engine generates an immutable Violation record containing violation ID, timestamp, license plate code, vehicle category, speed, offense description, and fine amount ($100 for speeding, $250 for red-light running, $300 for failure-to-yield). The record is automatically posted to the electronic violation ledger and exposed via the REST API."
        ]
    },
    {
        "heading": "3.7 Relational and In-Memory Data Models",
        "paragraphs": [
            "The data architecture of UrbanFlow AI is engineered for zero-garbage-collection overhead, high-speed concurrent lookups, and clean JSON serialization. Tables 3.1, 3.2, and 3.3 define the relational entity schemas governing in-memory vehicle entities, signal phase states, and electronic violation records.",
            "[TABLE_3_1_PLACEHOLDER]",
            "[TABLE_3_2_PLACEHOLDER]",
            "[TABLE_3_3_PLACEHOLDER]"
        ]
    },
    {
        "heading": "3.8 Entity-Relationship and Database Architecture",
        "paragraphs": [
            "To maintain high computational throughput during continuous 60 FPS execution, UrbanFlow AI utilizes high-performance concurrent in-memory data structures (specifically CopyOnWriteArrayList, ConcurrentLinkedQueue, and ConcurrentHashMap) synchronized with an SQLite-compatible relational schema for persistent violation logging.",
            "Figure 3.3 illustrates the comprehensive Entity-Relationship (ER) diagram, detailing primary keys, foreign key constraints, entity attributes, and cardinality mappings between Traffic Intersection, Vehicle Entities, Signal Phases, Pedestrian Agents, and Violation Records.",
            "[FIGURE_3_3_PLACEHOLDER]",
            "The entity relationships are defined as follows:",
            "- Intersection to Signal Phase (1 to N): Each intersection manages four directional signal phases (North, South, East, West) operating under adaptive synchronization.",
            "- Intersection to Vehicle Entity (1 to N): The intersection bounds multiple active vehicular entities traversing distinct approach lanes.",
            "- Intersection to Pedestrian Entity (1 to N): The intersection bounds pedestrian agents traversing designated zebra crosswalk corridors.",
            "- Vehicle Entity to Violation Record (1 to N): A vehicle entity may trigger multiple electronic violation events during transit across the intersection.",
            "- Signal Phase to Vehicle Entity (1 to N): Each signal phase governs vehicular approach movements for its designated corridor."
        ]
    }
]

TABLE_3_1_ROWS = [
    ("vehicleId", "INTEGER", "PRIMARY KEY", "Unique numeric identifier assigned upon vehicle generation"),
    ("plateNumber", "VARCHAR(12)", "NOT NULL", "Synthetic alphanumeric license plate (e.g., 'TN-01-AB-104')"),
    ("type", "VARCHAR(16)", "NOT NULL", "Vehicle category: CAR, BUS, TRUCK, or AMBULANCE"),
    ("posX, posY", "DOUBLE", "NOT NULL", "Current Cartesian coordinates within the 2D intersection coordinate space"),
    ("velocity", "DOUBLE", "NOT NULL", "Instantaneous longitudinal velocity (meters/second)"),
    ("targetSpeed", "DOUBLE", "NOT NULL", "Desired free-flow velocity governed by vehicle type (m/s)"),
    ("acceleration", "DOUBLE", "NOT NULL", "Current instantaneous acceleration/deceleration rate (m/s^2)"),
    ("direction", "VARCHAR(8)", "NOT NULL", "Approach corridor: NORTH_SOUTH or EAST_WEST"),
    ("isEmergency", "BOOLEAN", "NOT NULL", "Flag indicating emergency vehicle priority status"),
    ("isQueued", "BOOLEAN", "NOT NULL", "Flag set to true when vehicle is stopped at an intersection red light")
]

TABLE_3_2_ROWS = [
    ("phaseId", "INTEGER", "PRIMARY KEY", "Unique phase identifier: 0 (NORTH_SOUTH) or 1 (EAST_WEST)"),
    ("state", "VARCHAR(12)", "NOT NULL", "Current signal state: GREEN, YELLOW, RED, or ALL_RED_HOLD"),
    ("allocatedGreen", "DOUBLE", "NOT NULL", "Dynamic green duration calculated by adaptive optimization algorithm (s)"),
    ("elapsedTime", "DOUBLE", "NOT NULL", "Time elapsed in current signal phase state (seconds)"),
    ("minGreen", "DOUBLE", "NOT NULL", "Minimum allowable green phase duration boundary (10.0 s)"),
    ("maxGreen", "DOUBLE", "NOT NULL", "Maximum allowable green phase duration boundary (45.0 s)"),
    ("yellowDuration", "DOUBLE", "NOT NULL", "Fixed yellow clearance transition duration (3.0 s)"),
    ("allRedDuration", "DOUBLE", "NOT NULL", "Clearance interval duration between conflicting phases (1.5 s)")
]

TABLE_3_3_ROWS = [
    ("violationId", "INTEGER", "PRIMARY KEY AUTOINCREMENT", "Unique auto-incrementing infraction record identifier"),
    ("timestamp", "TIMESTAMP", "NOT NULL", "Timestamp of infraction occurrence formatted in ISO 8601"),
    ("plateNumber", "VARCHAR(12)", "NOT NULL", "License plate of the offending vehicle"),
    ("vehicleType", "VARCHAR(16)", "NOT NULL", "Classification of offending vehicle (CAR, BUS, TRUCK)"),
    ("speedKmh", "DOUBLE", "NOT NULL", "Measured velocity at time of violation (km/h)"),
    ("violationType", "VARCHAR(32)", "NOT NULL", "Infraction category: SPEEDING, RED_LIGHT_RUN, or FAILURE_TO_YIELD"),
    ("fineAmount", "DOUBLE", "NOT NULL", "Financial penalty assessed under municipal traffic code ($)")
]
