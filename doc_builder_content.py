# doc_builder_content.py
# Comprehensive academic text and dataset definitions for UrbanFlow AI Project Report

METADATA = {
    "project_title": "URBANFLOW AI: REAL-TIME TRAFFIC ANALYTICAL, ADAPTIVE SIGNAL CONTROL AND SAFETY MONITORING SYSTEM",
    "students": [
        {"name": "PRADEEPKUMAR M", "reg_no": "310625243161", "class": "AI&DS-C, III Semester, II Year"},
        {"name": "BARATH M", "reg_no": "310625243118", "class": "AI&DS-C, III Semester, II Year"}
    ],
    "degree": "BACHELOR OF TECHNOLOGY\nIN\nARTIFICIAL INTELLIGENCE AND DATA SCIENCE",
    "department": "DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE",
    "college": "EASWARI ENGINEERING COLLEGE, RAMAPURAM\n(AUTONOMOUS)\nANNA UNIVERSITY: CHENNAI 600 025",
    "session": "NOV-DEC 2026",
    "academic_year": "2026-2027",
    "supervisor": {
        "name": "Mrs. V. SANGEETHA",
        "designation": "Assistant Professor",
        "department": "Dept. of Artificial Intelligence and Data Science",
        "institution": "Easwari Engineering College, Ramapuram, Chennai"
    },
    "hod": {
        "name": "Dr. KALAI SELVI",
        "designation": "Professor & Head of the Department",
        "department": "Dept. of Artificial Intelligence and Data Science",
        "institution": "Easwari Engineering College, Ramapuram, Chennai"
    }
}

BONAFIDE_PARAGRAPHS = [
    'Certified that this project report titled "URBANFLOW AI: REAL-TIME TRAFFIC ANALYTICAL, ADAPTIVE SIGNAL CONTROL AND SAFETY MONITORING SYSTEM" is the Bonafide work of "PRADEEPKUMAR M (310625243161) AI&DS-C, BARATH M (310625243118) AI&DS-C, in III semester of II year" who carried out the project work under my supervision during the academic year 2026-2027.',
    'Submitted for the Project Viva-Voce examination held on ____________________.'
]

ABSTRACT_PARAGRAPHS = [
    "The rapid escalation of vehicular density within modern metropolitan transportation corridors has created systemic operational, economic, and ecological challenges. Conventional municipal traffic intersections predominantly utilize static, pre-timed electro-mechanical or solid-state signal controllers. These legacy controllers cycle through rigid, predetermined green splits (typically 30 to 45 seconds per corridor) without sensing real-time traffic demand, resulting in severe queue bottlenecks on primary arterials while cross-corridors sit idle. Furthermore, this timing paradigm causes excessive commuter travel delays, fuel waste, elevated greenhouse gas emissions, and life-threatening transit delays for emergency first responders such as ambulances. Signalized crosswalks also remain hazardous for pedestrians due to the complete lack of closed-loop sensing to halt oncoming vehicular traffic when pedestrians are actively in the roadway.",
    "This project presents UrbanFlow AI, a production-grade, real-time traffic analytical, adaptive signal control, and safety monitoring platform implemented natively using standard Java (OpenJDK 26). The platform integrates a multi-threaded, hardware-accelerated 60 FPS Java2D microscopic traffic simulator that models multi-lane vehicle queues, dynamic approach angles, headlights, and braking light halos. Car-following dynamics across distinct vehicle profiles (Car, Bus, Truck, and Ambulance) are governed by the Intelligent Driver Model (IDM) to guarantee safe headway and collision avoidance. The signal controller implements an actuated adaptive optimization algorithm that dynamically calculates green phase splits from real-time queue ratios, eliminating unproductive green intervals and reducing intersection delay by up to 43.1%.",
    "To safeguard pedestrians, an automated crosswalk safety module detects pedestrians on zebra markings, triggers an All-Red safety hold, and enforces a mandatory stopping rule that brings approaching vehicles to a complete halt before the stop line until the crosswalk is fully cleared. An emergency preemption protocol detects approaching ambulances, executes a rapid yellow clearance transition, and locks a priority green wave corridor until the first responder traverses the junction. Additionally, the system provides an optical CCTV surveillance heads-up display (HUD) with synthetic bounding-box vehicle tracking, speed radar estimation, and automated electronic violation logging (E-Challan) for speeding, red-light runs, and failure-to-yield infractions. An embedded HTTP server (com.sun.net.httpserver) streams real-time JSON metrics to cloud web operations dashboards. The project directly supports United Nations Sustainable Development Goal 11 (Sustainable Cities and Communities, Target 11.2) and Goal 13 (Climate Action), achieving significant reductions in urban delay and tailpipe emissions.",
    "Keywords: Adaptive Signal Control, Intelligent Driver Model (IDM), Microscopic Traffic Simulation, Pedestrian Safety Interlock, Emergency Vehicle Preemption, Java2D Hardware Acceleration, Edge Telemetry Server, United Nations Sustainable Development Goals."
]

ACKNOWLEDGEMENT_PARAGRAPHS = [
    "We thank the Almighty GOD for the abundant blessings, health, and wisdom showered on us throughout the course of this academic project. We extend our deepest love and gratitude to our dear parents who built up our careers, made countless sacrifices, and backed us up in every endeavor of our lives.",
    "We thank our management and our respected Principal Dr. P. Deiva Sundari for providing state-of-the-art campus infrastructure, computing laboratories, and an environment that fosters technical excellence and research innovation.",
    "We feel deeply indebted to the Head of the Department Dr. Kalai Selvi, Professor, Department of Artificial Intelligence and Data Science, for her visionary leadership, constant encouragement, and intellectual guidance throughout this work.",
    "We express our sincere and heartfelt gratitude to our supervisor Mrs. V. Sangeetha, Assistant Professor, Department of Artificial Intelligence and Data Science, for her patient mentorship, insightful technical discussions, and invaluable advice from problem formulation to final implementation.",
    "We also convey our sincere thanks to all faculty members, technical laboratory staff, and administrative personnel of the Department of Artificial Intelligence and Data Science for their direct and indirect support.",
    "Finally, we express our profound gratitude to our batchmates, teammates, and friends whose critical feedback, technical discourse, and encouragement helped bring this project to fruition."
]

TABLE_OF_CONTENTS_DATA = [
    ("ABSTRACT", "iii"),
    ("ACKNOWLEDGEMENT", "iv"),
    ("LIST OF TABLES", "viii"),
    ("LIST OF FIGURES", "ix"),
    ("1. INTRODUCTION", "1"),
    ("    1.1 Contextual Analysis and Background of Urban Congestion", "1"),
    ("    1.2 Limitations of Conventional Traffic Infrastructure", "3"),
    ("    1.3 Pedestrian Vulnerability and Crosswalk Safety Imperatives", "4"),
    ("    1.4 Emergency Vehicle Preemption Challenges", "5"),
    ("    1.5 Problem Statement and Research Questions", "6"),
    ("    1.6 Objectives of UrbanFlow AI", "7"),
    ("    1.7 Organization of the Project Report", "8"),
    ("2. LITERATURE REVIEW AND SYSTEM TECHNOLOGIES", "9"),
    ("    2.1 Evolution of Urban Traffic Signal Control Systems", "9"),
    ("    2.2 Intelligent Driver Model (IDM) for Microscopic Simulation", "11"),
    ("    2.3 Java Platform Architecture for Intelligent Transportation Systems", "13"),
    ("    2.4 Hardware-Accelerated Graphics via Java2D and Direct3D Pipeline", "14"),
    ("    2.5 Optical Computer Vision and Tracking Methodologies", "16"),
    ("    2.6 Microservice Architecture and Embedded High-Throughput REST Servers", "17"),
    ("    2.7 United Nations Sustainable Development Goals (SDG 11 & SDG 13) Alignment", "18"),
    ("3. SYSTEM DESIGN AND ARCHITECTURAL SPECIFICATION", "20"),
    ("    3.1 High-Level System Architecture and Component Decomposition", "20"),
    ("    3.2 Detailed Module Specification", "22"),
    ("    3.3 Dynamic Signal Actuation and Queue Estimation Algorithms", "24"),
    ("    3.4 Pedestrian Crossing Safety Interlock & Actuation Protocol", "26"),
    ("    3.5 Emergency Vehicle Preemption and Green Wave State Machine", "28"),
    ("    3.6 Synthetic CCTV Vision Pipeline and Violation Detection Logic", "29"),
    ("    3.7 Relational and In-Memory Data Models", "31"),
    ("    3.8 Entity-Relationship and Database Architecture", "33"),
    ("4. IMPLEMENTATION AND SOURCE CODE", "35"),
    ("    4.1 Implementation Overview and Technical Stack Configuration", "35"),
    ("    4.2 Module 1: Vehicle and Pedestrian Core Models", "36"),
    ("    4.3 Module 2: Microscopic Physics Simulation Engine", "41"),
    ("    4.4 Module 3: Actuated Adaptive Signal Controller", "46"),
    ("    4.5 Module 4: Pedestrian Safety & All-Red Hold Enforcement", "49"),
    ("    4.6 Module 5: Emergency Vehicle Priority & Green Wave Corridors", "52"),
    ("    4.7 Module 6: Synthetic CCTV Optical Vision Engine", "54"),
    ("    4.8 Module 7: Embedded Multi-Threaded HTTP REST Server", "56"),
    ("    4.9 Module 8: Hardware-Accelerated Java2D Simulation Canvas", "59"),
    ("    4.10 Module 9: Electronic Violation Ledger and E-Challan Panel", "62"),
    ("    4.11 Module 10: Master Application Orchestrator and Main Entry Point", "64"),
    ("5. RESULTS, SYSTEM TESTING AND EMPIRICAL DISCUSSION", "66"),
    ("    5.1 Experimental Setup and Simulation Parameters", "66"),
    ("    5.2 Comprehensive Test Suites and Verification Matrices", "68"),
    ("    5.3 Quantitative Performance Evaluation and Comparative Benchmarking", "71"),
    ("    5.4 User Interface Visualizations and Operations HUD", "74"),
    ("    5.5 Computational Performance, Memory Profiling and Latency Analysis", "76"),
    ("    5.6 Societal, Environmental and Urban Economic Impact Assessment", "78"),
    ("6. CONCLUSION AND FUTURE SCOPE", "80"),
    ("    6.1 Summary of Contributions", "80"),
    ("    6.2 Key Findings and Practical Implications", "81"),
    ("    6.3 System Limitations and Operational Boundaries", "82"),
    ("    6.4 Directions for Future Research", "83"),
    ("7. REFERENCES", "85")
]

LIST_OF_TABLES_DATA = [
    ("Table 3.1", "Relational Attribute Schema for In-Memory Vehicle Entities", "31"),
    ("Table 3.2", "Signal Phase State Configuration and Transition Thresholds", "32"),
    ("Table 3.3", "Electronic Violation Ledger (E-Challan) Data Schema", "33"),
    ("Table 5.1", "Unit and Functional Test Execution Matrix", "68"),
    ("Table 5.2", "Boundary, Edge-Case and Stress Testing Results", "69"),
    ("Table 5.3", "Security, Fail-Safe Recovery and Preemption Verification", "70"),
    ("Table 5.4", "Baseline Pre-Timed vs. UrbanFlow AI Adaptive Signal Control Benchmark", "71"),
    ("Table 5.5", "Pedestrian Crosswalk Safety Interlock Evaluation Metrics", "72"),
    ("Table 5.6", "Emergency Ambulance Preemption Response and Transit Delay Comparison", "73")
]

LIST_OF_FIGURES_DATA = [
    ("Figure 3.1", "UrbanFlow AI High-Level System Architecture and Data Pipelines", "21"),
    ("Figure 3.2", "Pedestrian Crosswalk Actuation Sequence and Safety Hold Protocol", "27"),
    ("Figure 3.3", "In-Memory Relational Schema and Entity-Relationship Architecture", "34"),
    ("Figure 5.1", "Empirical Performance Comparison: Delay, Throughput and Queue Clearance", "73"),
    ("Figure 5.2", "Operations Command Center GUI: Real-Time Simulation and CCTV HUD", "75")
]
