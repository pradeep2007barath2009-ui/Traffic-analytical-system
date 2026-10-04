import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import AccessibilityToolbar from './components/AccessibilityToolbar';
import MetricCards from './components/MetricCards';
import CctvStreamView from './components/CctvStreamView';
import IntersectionVisualizer from './components/IntersectionVisualizer';
import SimulationControls from './components/SimulationControls';
import ViolationLedger from './components/ViolationLedger';
import AnalyticsCharts from './components/AnalyticsCharts';
import VehicleTypesSection from './components/VehicleTypesSection';
import PresentationSlides from './components/PresentationSlides';
import ShortcutsModal from './components/ShortcutsModal';
import GuidedTourModal from './components/GuidedTourModal';
import AuthPortal from './components/auth/AuthPortal';
import { LayoutGrid, Video, Compass, Car, ShieldAlert, BarChart3, Presentation, Radio, Footprints } from 'lucide-react';

const CAMERAS_META = [
  { id: 'CAM-01', label: 'Highway 101 Inflow', area: 'North Expressway', limit: 70, status: 'ONLINE', resolution: '1920x1080' },
  { id: 'CAM-02', label: 'Express Toll Plaza', area: 'North Expressway', limit: 60, status: 'ONLINE', resolution: '1920x1080' },
  { id: 'CAM-03', label: 'Central 4-Way Junction', area: 'Downtown Commercial', limit: 50, status: 'ONLINE', resolution: '1920x1080' },
  { id: 'CAM-04', label: 'Main Ave Transit Hub', area: 'Downtown Commercial', limit: 40, status: 'ONLINE', resolution: '1920x1080' },
  { id: 'CAM-05', label: 'East Boulevard Inflow', area: 'Tech Park Corridor', limit: 60, status: 'ONLINE', resolution: '1920x1080' },
  { id: 'CAM-06', label: 'West Metro Interchange', area: 'Tech Park Corridor', limit: 45, status: 'ONLINE', resolution: '1920x1080' },
  { id: 'CAM-07', label: 'Trauma Center Emergency Gate', area: 'Hospital Green Route', limit: 50, status: 'ONLINE', resolution: '1920x1080' },
  { id: 'CAM-08', label: 'Green Route Clearance Sensor', area: 'Hospital Green Route', limit: 50, status: 'ONLINE', resolution: '1920x1080' }
];

const INITIAL_VEHICLES = [
  { id: 101, approach: 'N', type: 'car', dist: 130, speed: 48, stopped: false, is_emergency: false },
  { id: 102, approach: 'N', type: 'truck', dist: 85, speed: 38, stopped: false, is_emergency: false },
  { id: 103, approach: 'S', type: 'car', dist: 110, speed: 52, stopped: false, is_emergency: false },
  { id: 104, approach: 'S', type: 'motorcycle', dist: 40, speed: 45, stopped: false, is_emergency: false },
  { id: 105, approach: 'E', type: 'bus', dist: 95, speed: 34, stopped: false, is_emergency: false },
  { id: 106, approach: 'E', type: 'car', dist: 50, speed: 42, stopped: false, is_emergency: false },
  { id: 107, approach: 'W', type: 'car', dist: 125, speed: 46, stopped: false, is_emergency: false },
  { id: 108, approach: 'W', type: 'motorcycle', dist: 70, speed: 50, stopped: false, is_emergency: false }
];

const INITIAL_PEDESTRIANS = [
  { id: 501, approach: 'N', progress: 0.35 }
];

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [activeSection, setActiveSection] = useState('unified');
  const [theme, setTheme] = useState('theme-cyber');
  
  // Accessibility Preferences
  const [colorblindMode, setColorblindMode] = useState(false);
  const [voiceAnnounce, setVoiceAnnounce] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const [telemetry, setTelemetry] = useState({
    signals: {
      mode: 'ADAPTIVE',
      current_phase: 'NS_GREEN',
      ns_light: 'GREEN',
      ew_light: 'RED',
      phase_duration: 25.0,
      time_remaining_sec: 18.0,
      green_corridor: {
        active: false,
        direction: null,
        reason: '',
        cleared_count: 3,
        time_saved_sec: 42
      },
      queues: { north_south: 4, east_west: 3 }
    },
    metrics: {
      active_vehicles: 8,
      total_cleared: 142,
      avg_speed_kmh: 41.8,
      avg_wait_sec: 9.4,
      congestion_index: 32,
      wait_reduction_pct: 38.6,
      co2_saved_kg: 3.42,
      traffic_density: 'MEDIUM',
      by_type: {
        car: { count: 4, avg_speed: 44.5 },
        motorcycle: { count: 2, avg_speed: 48.0 },
        bus: { count: 1, avg_speed: 34.0 },
        truck: { count: 1, avg_speed: 36.2 },
        ambulance: { count: 0, avg_speed: 0 }
      }
    },
    vehicles: INITIAL_VEHICLES,
    pedestrians: INITIAL_PEDESTRIANS,
    crosswalk_active: true,
    cameras: CAMERAS_META,
    junctions: {}
  });

  const [selectedCamId, setSelectedCamId] = useState('CAM-01');
  const [syncWithCctv, setSyncWithCctv] = useState(true);
  const [violations, setViolations] = useState([
    {
      id: 'INF-8921',
      timestamp: new Date(Date.now() - 45000).toLocaleTimeString(),
      camera_id: 'CAM-01',
      area: 'North Expressway',
      vehicle_type: 'Passenger Car',
      vehicle_id: '108',
      type: 'Overspeeding (74 km/h)',
      speed: '74 km/h',
      status: 'CITATION ISSUED'
    },
    {
      id: 'INF-8920',
      timestamp: new Date(Date.now() - 95000).toLocaleTimeString(),
      camera_id: 'CAM-03',
      area: 'Downtown Commercial',
      vehicle_type: 'Passenger Car',
      vehicle_id: '106',
      type: 'Failure to Yield to Pedestrian',
      speed: '32 km/h',
      status: 'CITATION ISSUED'
    },
    {
      id: 'INF-8919',
      timestamp: new Date(Date.now() - 150000).toLocaleTimeString(),
      camera_id: 'CAM-03',
      area: 'Downtown Commercial',
      vehicle_type: 'Commercial Truck',
      vehicle_id: '102',
      type: 'Red Light Intrusion',
      speed: '38 km/h',
      status: 'CITATION ISSUED'
    }
  ]);
  
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('urbanflow_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const wsRef = useRef(null);

  // Web Speech API Voice Announcer
  const speakAlert = useCallback((text) => {
    if (!voiceAnnounce || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }, [voiceAnnounce]);

  // Auth Handlers
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
    if (voiceAnnounce) {
      speakAlert(`Officer authorized. Welcome to UrbanFlow command center, ${user.name}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('urbanflow_user');
    setCurrentUser(null);
    setIsAuthOpen(true);
    if (voiceAnnounce) {
      speakAlert('Console locked. Session concluded.');
    }
  };

  // --- AUTONOMOUS EDGE SIMULATION LOOP (When backend WebSocket is disconnected) ---
  useEffect(() => {
    if (isConnected) return; // Backend is active; skip client simulation

    const simInterval = setInterval(() => {
      setTelemetry((prev) => {
        const sig = { ...prev.signals };
        let remaining = Math.max(0, sig.time_remaining_sec - 0.1);

        // Phase Transitions
        let phase = sig.current_phase;
        let ns = sig.ns_light;
        let ew = sig.ew_light;

        if (sig.green_corridor?.active) {
          if (sig.green_corridor.direction === 'NS') {
            ns = 'GREEN';
            ew = 'RED';
            phase = 'NS_EMERGENCY';
          } else {
            ns = 'RED';
            ew = 'GREEN';
            phase = 'EW_EMERGENCY';
          }
        } else if (remaining <= 0) {
          if (phase === 'NS_GREEN') {
            phase = 'NS_YELLOW';
            ns = 'YELLOW';
            ew = 'RED';
            remaining = 3.0;
          } else if (phase === 'NS_YELLOW') {
            phase = 'EW_GREEN';
            ns = 'RED';
            ew = 'GREEN';
            remaining = 18.0;
          } else if (phase === 'EW_GREEN') {
            phase = 'EW_YELLOW';
            ns = 'RED';
            ew = 'YELLOW';
            remaining = 3.0;
          } else {
            phase = 'NS_GREEN';
            ns = 'GREEN';
            ew = 'RED';
            remaining = 20.0;
          }
        }

        // Update Pedestrians along crosswalks
        let currentPedestrians = (prev.pedestrians || []).map((p) => {
          const nextProg = p.progress + 0.012;
          return { ...p, progress: nextProg };
        }).filter((p) => p.progress < 1.05);

        // Automatically spawn occasional crossing pedestrians if none active
        if (currentPedestrians.length === 0 && Math.random() < 0.03) {
          currentPedestrians = [{
            id: 500 + Math.floor(Math.random() * 50),
            approach: Math.random() > 0.5 ? 'N' : 'S',
            progress: 0.05
          }];
        }

        const isCrosswalkActive = currentPedestrians.length > 0;

        // Move Vehicles along approaches with crosswalk yield logic
        const updatedVehicles = prev.vehicles.map((v) => {
          const isNS = v.approach === 'N' || v.approach === 'S';
          const signalCanGo = (isNS && ns === 'GREEN') || (!isNS && ew === 'GREEN');
          const pedInApproach = currentPedestrians.some((p) => p.approach === v.approach && p.progress > 0.1 && p.progress < 0.9);
          
          let stopped = false;
          let speed = v.speed;

          // Stop Line check (must yield to pedestrians in crosswalk or stop on red)
          if ((!signalCanGo || pedInApproach) && v.dist <= 48 && v.dist >= 12 && !v.is_emergency) {
            stopped = true;
            speed = 0;
          } else {
            stopped = false;
            speed = v.type === 'ambulance' ? 68 : v.type === 'truck' ? 36 : 46;
          }

          let dist = v.dist - (speed / 3.6) * 0.1 * 1.6;

          // Respawn after crossing
          if (dist < -50) {
            if (v.is_emergency) {
              sig.green_corridor = { ...sig.green_corridor, active: false };
              return null;
            }
            dist = 145 + Math.random() * 25;
            speed = 40 + Math.random() * 15;
          }

          return { ...v, dist, speed, stopped };
        }).filter(Boolean);

        // Queues calculation
        const queues = {
          north_south: updatedVehicles.filter((v) => (v.approach === 'N' || v.approach === 'S') && v.stopped).length,
          east_west: updatedVehicles.filter((v) => (v.approach === 'E' || v.approach === 'W') && v.stopped).length
        };

        const activeJunctions = { ...prev.junctions };
        CAMERAS_META.forEach((cam) => {
          activeJunctions[cam.id] = {
            signals: {
              ...sig,
              current_phase: phase,
              ns_light: ns,
              ew_light: ew,
              time_remaining_sec: Math.round(remaining * 10) / 10,
              queues
            },
            vehicles: updatedVehicles,
            pedestrians: currentPedestrians,
            crosswalk_active: isCrosswalkActive,
            metrics: prev.metrics
          };
        });

        return {
          ...prev,
          signals: {
            ...sig,
            current_phase: phase,
            ns_light: ns,
            ew_light: ew,
            time_remaining_sec: Math.round(remaining * 10) / 10,
            queues
          },
          vehicles: updatedVehicles,
          pedestrians: currentPedestrians,
          crosswalk_active: isCrosswalkActive,
          junctions: activeJunctions,
          metrics: {
            ...prev.metrics,
            active_vehicles: updatedVehicles.length,
            congestion_index: Math.min(80, Math.round(queues.north_south * 8 + queues.east_west * 8 + 18))
          }
        };
      });
    }, 100);

    return () => clearInterval(simInterval);
  }, [isConnected]);

  // Update Settings API
  const handleUpdateSettings = async (settings) => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
    } catch {
      // Local fallback
    }

    setTelemetry((prev) => {
      const nextJunctions = { ...prev.junctions };
      if (settings.cam && nextJunctions[settings.cam]) {
        nextJunctions[settings.cam] = {
          ...nextJunctions[settings.cam],
          signals: {
            ...nextJunctions[settings.cam].signals,
            mode: settings.mode || nextJunctions[settings.cam].signals?.mode
          },
          metrics: {
            ...nextJunctions[settings.cam].metrics,
            traffic_density: settings.density || nextJunctions[settings.cam].metrics?.traffic_density
          }
        };
      }
      return {
        ...prev,
        signals: {
          ...prev.signals,
          mode: settings.mode || prev.signals.mode
        },
        metrics: {
          ...prev.metrics,
          traffic_density: settings.density || prev.metrics.traffic_density
        },
        junctions: nextJunctions
      };
    });

    if (settings.mode && voiceAnnounce) {
      speakAlert(`Signal Controller switched to ${settings.mode === 'ADAPTIVE' ? 'Adaptive AI Mode' : 'Fixed Baseline Mode'}`);
    }
    if (settings.density && voiceAnnounce) {
      speakAlert(`Traffic demand set to ${settings.density.replace('_', ' ')}`);
    }
  };

  // Trigger Emergency Corridor Preemption
  const handleTriggerPreemption = async (direction = 'NS', cam = null) => {
    try {
      await fetch('/api/corridor/preempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          direction,
          cam,
          reason: `Emergency Ambulance Priority Route on ${cam || 'All Intersections'}`
        })
      });
    } catch {
      // Local client fallback
    }

    setTelemetry((prev) => {
      const ambulance = {
        id: Date.now(),
        approach: direction === 'NS' ? 'N' : 'E',
        type: 'ambulance',
        dist: 140,
        speed: 68,
        stopped: false,
        is_emergency: true
      };
      return {
        ...prev,
        signals: {
          ...prev.signals,
          current_phase: direction === 'NS' ? 'NS_EMERGENCY' : 'EW_EMERGENCY',
          ns_light: direction === 'NS' ? 'GREEN' : 'RED',
          ew_light: direction === 'NS' ? 'RED' : 'GREEN',
          time_remaining_sec: 25.0,
          green_corridor: {
            active: true,
            direction,
            reason: 'Ambulance Unit Preemption',
            cleared_count: (prev.signals.green_corridor?.cleared_count || 0) + 1,
            time_saved_sec: (prev.signals.green_corridor?.time_saved_sec || 0) + 38
          }
        },
        vehicles: [ambulance, ...prev.vehicles]
      };
    });

    speakAlert(`Priority Alert! Emergency green corridor engaged on ${direction === 'NS' ? 'North South' : 'East West'} route.`);
  };

  // Trigger Pedestrian Crosswalk Clearance
  const handleTriggerPedestrian = async (approach = 'N', cam = null) => {
    try {
      await fetch('/api/pedestrian/crossing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approach, cam })
      });
    } catch {
      // Local client fallback
    }

    const newPed = {
      id: Math.floor(Math.random() * 800) + 100,
      approach: approach || 'N',
      progress: 0.05
    };

    setTelemetry((prev) => ({
      ...prev,
      crosswalk_active: true,
      pedestrians: [newPed, ...(prev.pedestrians || [])]
    }));

    speakAlert(`Pedestrian crosswalk active on ${approach === 'N' ? 'North' : approach === 'S' ? 'South' : approach === 'E' ? 'East' : 'West'} crosswalk. Signals holding traffic for safety.`);
  };

  // Export Infraction Ledger to CSV
  const handleExportCsv = () => {
    if (violations.length === 0) {
      alert('No violations recorded yet to export.');
      return;
    }
    const headers = ['Incident ID', 'Timestamp', 'Vehicle Type', 'Vehicle ID', 'Infraction Type', 'Recorded Speed', 'Status'];
    const rows = violations.map((v) => [
      v.id,
      v.timestamp,
      v.vehicle_type,
      v.vehicle_id,
      v.type,
      v.speed,
      v.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UrbanFlow_Violations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (voiceAnnounce) {
      speakAlert('Violation ledger exported as CSV report.');
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
        setIsGuideOpen(false);
      } else if (e.key === 'a' || e.key === 'A' || e.code === 'Space') {
        e.preventDefault();
        handleTriggerPreemption('NS');
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        handleTriggerPedestrian('N');
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        const nextMode = telemetry.signals.mode === 'ADAPTIVE' ? 'FIXED' : 'ADAPTIVE';
        handleUpdateSettings({ mode: nextMode });
      } else if (e.key === '1') {
        handleUpdateSettings({ density: 'LOW' });
      } else if (e.key === '2') {
        handleUpdateSettings({ density: 'MEDIUM' });
      } else if (e.key === '3') {
        handleUpdateSettings({ density: 'RUSH_HOUR' });
      } else if (e.key === 'c' || e.key === 'C') {
        setColorblindMode((prev) => !prev);
      } else if (e.key === 'v' || e.key === 'V') {
        setVoiceAnnounce((prev) => !prev);
      } else if (e.key === 'e' || e.key === 'E') {
        handleExportCsv();
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        handleLogout();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [telemetry.signals?.mode, voiceAnnounce, violations]);

  // WebSocket Telemetry Connection (Local or Remote Backend)
  useEffect(() => {
    let reconnectTimeout = null;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/telemetry`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setTelemetry((prev) => ({
              ...prev,
              signals: data.signals || prev.signals,
              metrics: data.metrics || prev.metrics,
              vehicles: data.vehicles || prev.vehicles,
              pedestrians: data.pedestrians || prev.pedestrians,
              crosswalk_active: data.crosswalk_active !== undefined ? data.crosswalk_active : prev.crosswalk_active,
              cameras: data.cameras || prev.cameras,
              junctions: data.junctions || prev.junctions
            }));

            if (data.latest_violation) {
              setViolations((prev) => {
                if (prev.some((v) => v.id === data.latest_violation.id)) return prev;
                return [data.latest_violation, ...prev];
              });
            }
          } catch (e) {
            console.error('Error parsing telemetry:', e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimeout = setTimeout(connectWebSocket, 4000);
        };

        ws.onerror = () => {
          setIsConnected(false);
        };
      } catch {
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  const fontClass = fontSize === 'xl' ? 'text-base' : fontSize === 'large' ? 'text-[15px]' : 'text-sm';

  return (
    <div className={`min-h-screen ${theme} bg-slate-950 text-slate-100 flex flex-col font-sans ${fontClass} ${reducedMotion ? 'motion-reduce' : ''}`}>
      {/* Top Navigation */}
      <Navbar
        isConnected={isConnected}
        greenCorridor={telemetry.signals?.green_corridor}
        mode={telemetry.signals?.mode}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Accessibility & Quick Tooling Bar */}
      <AccessibilityToolbar
        colorblindMode={colorblindMode}
        setColorblindMode={setColorblindMode}
        voiceAnnounce={voiceAnnounce}
        setVoiceAnnounce={setVoiceAnnounce}
        fontSize={fontSize}
        setFontSize={setFontSize}
        reducedMotion={reducedMotion}
        setReducedMotion={setReducedMotion}
        theme={theme}
        setTheme={setTheme}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onExportCsv={handleExportCsv}
      />

      {/* Main Operations Dashboard Body */}
      <main className="flex-1 p-4 lg:p-6 space-y-5 max-w-[1720px] mx-auto w-full">
        {/* Operations Dock / Section Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="p-1 bg-slate-950/80 rounded-2xl border border-white/5 shadow-xl flex flex-wrap items-center gap-1.5 font-mono">
            {[
              { id: 'unified', label: 'Command Center', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
              { id: 'slides', label: 'Briefing Deck', icon: <Presentation className="w-3.5 h-3.5" />, badge: '7 Slides' },
              { id: 'vision', label: 'Optical Surveillance', icon: <Video className="w-3.5 h-3.5" />, badge: '30 FPS' },
              { id: 'adaptive', label: 'Junction Controller', icon: <Compass className="w-3.5 h-3.5" />, badge: 'Webster' },
              { id: 'fleet', label: 'Fleet Matrix', icon: <Car className="w-3.5 h-3.5" />, badge: '5 Classes' },
              { id: 'violations', label: 'Enforcement Ledger', icon: <ShieldAlert className="w-3.5 h-3.5" />, badge: `${violations.length}` },
              { id: 'analytics', label: 'Mobility Analytics', icon: <BarChart3 className="w-3.5 h-3.5" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSection(tab.id);
                  if (voiceAnnounce) speakAlert(`Viewing ${tab.label} section`);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeSection === tab.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      activeSection === tab.id ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-cyan-400 border border-white/10'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="hidden xl:flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{isConnected ? 'Backend Link Active' : 'Edge Micro-Simulation'}</span>
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-400 font-bold">8 Cameras Available</span>
          </div>
        </div>

        {/* Global KPI Telemetry Cards */}
        <MetricCards
          metrics={telemetry.metrics}
          greenCorridor={telemetry.signals?.green_corridor}
        />

        {/* SECTION: 1. UNIFIED COMMAND CENTER */}
        {activeSection === 'unified' && (
          <div className="space-y-5 animate-in fade-in">
            {/* Live CCTV Vision + 4-Way Junction Visualizer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7">
                <CctvStreamView
                  onSettingChange={handleUpdateSettings}
                  cameras={telemetry.cameras}
                  selectedCamId={selectedCamId}
                  onSelectCam={setSelectedCamId}
                />
              </div>
              <div className="lg:col-span-5">
                <IntersectionVisualizer
                  signals={telemetry.signals}
                  vehicles={telemetry.vehicles}
                  pedestrians={telemetry.pedestrians}
                  onTriggerPedestrian={handleTriggerPedestrian}
                  crosswalkActive={telemetry.crosswalk_active}
                  greenCorridor={telemetry.signals?.green_corridor}
                  colorblindMode={colorblindMode}
                  reducedMotion={reducedMotion}
                  junctions={telemetry.junctions}
                  selectedCamId={selectedCamId}
                  onSelectCam={setSelectedCamId}
                  syncWithCctv={syncWithCctv}
                  onToggleSync={() => setSyncWithCctv((prev) => !prev)}
                  cameras={telemetry.cameras}
                />
              </div>
            </div>

            {/* Vehicle Fleet Breakdown */}
            <VehicleTypesSection
              metrics={telemetry.metrics}
              onInjectAmbulance={() => handleTriggerPreemption('NS')}
            />

            {/* Simulation Controls & Scenario Dock + Violation Ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-5">
                <SimulationControls
                  currentMode={telemetry.signals?.mode}
                  currentDensity={telemetry.metrics?.traffic_density}
                  onUpdateSettings={handleUpdateSettings}
                  onTriggerPreemption={handleTriggerPreemption}
                  onTriggerPedestrian={handleTriggerPedestrian}
                  selectedCamId={selectedCamId}
                  onSelectCam={setSelectedCamId}
                  junctions={telemetry.junctions}
                  cameras={telemetry.cameras}
                  syncWithCctv={syncWithCctv}
                  onToggleSync={() => setSyncWithCctv((prev) => !prev)}
                />
              </div>
              <div className="lg:col-span-7">
                <ViolationLedger violations={violations} />
              </div>
            </div>

            {/* Historical & Predictive Mobility Analytics */}
            <AnalyticsCharts />
          </div>
        )}

        {/* SECTION: 2. COMPUTER VISION SURVEILLANCE */}
        {activeSection === 'vision' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in">
            <div className="lg:col-span-8">
              <CctvStreamView
                onSettingChange={handleUpdateSettings}
                cameras={telemetry.cameras}
                selectedCamId={selectedCamId}
                onSelectCam={setSelectedCamId}
              />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-2xl bg-slate-950/70 p-1 border border-white/5 shadow-xl">
                <div className="rounded-xl bg-slate-900/90 border border-white/5 p-4 backdrop-blur-md space-y-3 font-mono">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Video className="w-4 h-4 text-cyan-400" />
                    Computer Vision Telemetry
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-300">
                      <span className="text-slate-400">Frame Resolution:</span>
                      <span className="text-cyan-400 font-bold">1920 x 1080 Native</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-300">
                      <span className="text-slate-400">Inference Pipeline:</span>
                      <span className="text-emerald-400 font-bold">YOLOv8 + Crosswalk ROI</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-300">
                      <span className="text-slate-400">Speed Calibration:</span>
                      <span className="text-slate-200">2.8 px/frame = 1 km/h</span>
                    </div>
                    <div className="flex justify-between py-1.5 text-slate-300">
                      <span className="text-slate-400">Pedestrian Crosswalk:</span>
                      <span className="text-cyan-400 font-bold">Zebra Zone Active</span>
                    </div>
                  </div>
                </div>
              </div>
              <ViolationLedger violations={violations} />
            </div>
          </div>
        )}

        {/* SECTION: 3. ADAPTIVE SIGNAL CONTROL & 4-WAY SIMULATOR */}
        {activeSection === 'adaptive' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in">
            <div className="lg:col-span-7">
              <IntersectionVisualizer
                signals={telemetry.signals}
                vehicles={telemetry.vehicles}
                pedestrians={telemetry.pedestrians}
                onTriggerPedestrian={handleTriggerPedestrian}
                crosswalkActive={telemetry.crosswalk_active}
                greenCorridor={telemetry.signals?.green_corridor}
                colorblindMode={colorblindMode}
                reducedMotion={reducedMotion}
                junctions={telemetry.junctions}
                selectedCamId={selectedCamId}
                onSelectCam={setSelectedCamId}
                syncWithCctv={syncWithCctv}
                onToggleSync={() => setSyncWithCctv((prev) => !prev)}
                cameras={telemetry.cameras}
              />
            </div>
            <div className="lg:col-span-5">
              <SimulationControls
                currentMode={telemetry.signals?.mode}
                currentDensity={telemetry.metrics?.traffic_density}
                onUpdateSettings={handleUpdateSettings}
                onTriggerPreemption={handleTriggerPreemption}
                onTriggerPedestrian={handleTriggerPedestrian}
                selectedCamId={selectedCamId}
                onSelectCam={setSelectedCamId}
                junctions={telemetry.junctions}
                cameras={telemetry.cameras}
                syncWithCctv={syncWithCctv}
                onToggleSync={() => setSyncWithCctv((prev) => !prev)}
              />
            </div>
          </div>
        )}

        {/* SECTION: 4. VEHICLE FLEET CLASSES */}
        {activeSection === 'fleet' && (
          <div className="animate-in fade-in">
            <VehicleTypesSection
              metrics={telemetry.metrics}
              onInjectAmbulance={() => handleTriggerPreemption('NS')}
            />
          </div>
        )}

        {/* SECTION: 5. VIOLATIONS & E-CHALLAN LEDGER */}
        {activeSection === 'violations' && (
          <div className="animate-in fade-in">
            <ViolationLedger violations={violations} />
          </div>
        )}

        {/* SECTION: 6. MOBILITY & EMISSIONS ANALYTICS */}
        {activeSection === 'analytics' && (
          <div className="animate-in fade-in">
            <AnalyticsCharts />
          </div>
        )}

        {/* SECTION: 7. PRESENTATION SLIDES DECK */}
        {activeSection === 'slides' && (
          <div className="animate-in fade-in">
            <PresentationSlides
              metrics={telemetry.metrics}
              signals={telemetry.signals}
              onInjectAmbulance={() => handleTriggerPreemption('NS')}
              onExitSlides={() => setActiveSection('unified')}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950/90 px-6 py-3 font-mono text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-400 font-bold">URBANFLOW AI</span>
          <span>• Municipal Traffic Operations & Dynamic Signal Optimization</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span>MODE: <strong className="text-cyan-400">{isConnected ? 'ONLINE BACKEND' : 'BROWSER EDGE SIM'}</strong></span>
          <span>STATUS: <strong className="text-emerald-400">NOMINAL</strong></span>
          <span>SECURITY: <strong className="text-slate-300">TLS ENCRYPTED</strong></span>
        </div>
      </footer>

      {/* Modals */}
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
      <GuidedTourModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Sign In & Register Portal with 3D Animation */}
      {(!currentUser || isAuthOpen) && (
        <AuthPortal
          onLoginSuccess={handleLoginSuccess}
          onCancel={currentUser ? () => setIsAuthOpen(false) : undefined}
        />
      )}
    </div>
  );
}
