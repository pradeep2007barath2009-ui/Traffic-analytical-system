import React, { useState } from 'react';
import {
  Compass,
  GitCommit,
  Link,
  Unlink,
  MapPin,
  Gauge,
  Activity,
  ShieldAlert,
  Sliders,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const DEFAULT_JUNCTION_CONFIGS = {
  'CAM-01': {
    id: 'CAM-01',
    label: 'Highway 101 Inflow',
    area: 'North Expressway',
    speed_limit: 70,
    topology: 'EXPRESSWAY',
    approaches: {
      N: 'Expressway Inflow North',
      S: 'Highway 101 Bypass South',
      E: 'Service Connector East',
      W: 'Outer Ring Road West'
    }
  },
  'CAM-02': {
    id: 'CAM-02',
    label: 'Express Toll Plaza',
    area: 'North Expressway',
    speed_limit: 60,
    topology: 'TOLL_PLAZA',
    approaches: {
      N: 'Toll Gantry North',
      S: 'Toll Plaza South',
      E: 'Fastag Feeder East',
      W: 'Weigh Lane West'
    }
  },
  'CAM-03': {
    id: 'CAM-03',
    label: 'Central 4-Way Junction',
    area: 'Downtown Commercial',
    speed_limit: 50,
    topology: 'URBAN_GRID',
    approaches: {
      N: 'Broadway Blvd North',
      S: 'Market St South',
      E: '5th Ave East',
      W: 'Commerce Way West'
    }
  },
  'CAM-04': {
    id: 'CAM-04',
    label: 'Main Ave Transit Hub',
    area: 'Downtown Commercial',
    speed_limit: 40,
    topology: 'TRANSIT_HUB',
    approaches: {
      N: 'Metro Busway North',
      S: 'Central Terminal South',
      E: 'Tram Route East',
      W: 'City Corridor West'
    }
  },
  'CAM-05': {
    id: 'CAM-05',
    label: 'East Boulevard Inflow',
    area: 'Tech Park Corridor',
    speed_limit: 60,
    topology: 'TECH_CORRIDOR',
    approaches: {
      N: 'Innovation Way North',
      S: 'Silicon Pkwy South',
      E: 'Campus Bypass East',
      W: 'Research Ring West'
    }
  },
  'CAM-06': {
    id: 'CAM-06',
    label: 'West Metro Interchange',
    area: 'Tech Park Corridor',
    speed_limit: 45,
    topology: 'INTERCHANGE',
    approaches: {
      N: 'Overpass Inflow North',
      S: 'Underpass Outflow South',
      E: 'Metro Link East',
      W: 'Station Access West'
    }
  },
  'CAM-07': {
    id: 'CAM-07',
    label: 'Trauma Center Emergency Gate',
    area: 'Hospital Green Route',
    speed_limit: 50,
    topology: 'EMERGENCY_ROUTE',
    approaches: {
      N: 'Ambulance Bay North',
      S: 'Emergency Clinic South',
      E: 'Helipad Corridor East',
      W: 'Triage Access West'
    }
  },
  'CAM-08': {
    id: 'CAM-08',
    label: 'Green Route Clearance Sensor',
    area: 'Hospital Green Route',
    speed_limit: 50,
    topology: 'EMERGENCY_CLEARANCE',
    approaches: {
      N: 'Hospital Expwy North',
      S: 'Rapid Transit South',
      E: 'Trauma Link East',
      W: 'Perimeter Loop West'
    }
  }
};

const AREAS = [
  'ALL',
  'North Expressway',
  'Downtown Commercial',
  'Tech Park Corridor',
  'Hospital Green Route'
];

export default function IntersectionVisualizer({
  signals,
  vehicles = [],
  greenCorridor,
  colorblindMode = false,
  reducedMotion = false,
  junctions = {},
  selectedCamId = 'CAM-01',
  onSelectCam,
  syncWithCctv = true,
  onToggleSync,
  cameras = []
}) {
  const [internalCamId, setInternalCamId] = useState('CAM-01');
  const [selectedArea, setSelectedArea] = useState('ALL');

  // Synchronized selectedCamId or internal state
  const activeCamId = syncWithCctv ? selectedCamId : internalCamId;

  // Retrieve junction state for active camera
  const jState = junctions[activeCamId];
  const activeSignals = jState?.signals || signals || {};
  const activeVehicles = jState?.vehicles || vehicles || [];
  const activeConfig = jState?.config || DEFAULT_JUNCTION_CONFIGS[activeCamId] || DEFAULT_JUNCTION_CONFIGS['CAM-03'];

  const {
    current_phase = 'NS_GREEN',
    ns_light = 'GREEN',
    ew_light = 'RED',
    time_remaining_sec = 0,
    queues = { north_south: 0, east_west: 0 }
  } = activeSignals;

  const handleSelectCamera = (camId) => {
    if (syncWithCctv && onSelectCam) {
      onSelectCam(camId);
    } else {
      setInternalCamId(camId);
    }
  };

  // Center coordinates of 500x500 canvas
  const cx = 250;
  const cy = 250;
  const roadWidth = 114;
  const halfRoad = roadWidth / 2;

  // Signal color helpers
  const getLightBg = (color, target) => {
    if (color === target) {
      if (target === 'GREEN') return 'bg-emerald-400 shadow-lg shadow-emerald-400/80 ring-2 ring-emerald-300 text-slate-950 font-bold';
      if (target === 'YELLOW') return 'bg-amber-400 shadow-lg shadow-amber-400/80 ring-2 ring-amber-300 text-slate-950 font-bold';
      if (target === 'RED') return 'bg-rose-500 shadow-lg shadow-rose-500/80 ring-2 ring-rose-400 text-white font-bold';
    }
    return 'bg-slate-950/80 opacity-25 text-transparent border border-white/5';
  };

  // Convert vehicle distance (160m to -60m) into canvas coordinates
  const getVehiclePos = (v) => {
    const px = v.dist * 1.35;
    let x = cx, y = cy, rot = 0;

    switch (v.approach) {
      case 'N':
        x = cx - 22;
        y = cy - px;
        rot = 180;
        break;
      case 'S':
        x = cx + 22;
        y = cy + px;
        rot = 0;
        break;
      case 'E':
        x = cx + px;
        y = cy - 22;
        rot = 270;
        break;
      case 'W':
        x = cx - px;
        y = cy + 22;
        rot = 90;
        break;
      default:
        break;
    }
    return { x, y, rot };
  };

  const camList = Object.keys(DEFAULT_JUNCTION_CONFIGS).map((id) => ({
    id,
    ...DEFAULT_JUNCTION_CONFIGS[id]
  }));

  const filteredCamList = camList.filter((c) => {
    if (selectedArea === 'ALL') return true;
    return c.area === selectedArea;
  });

  const isEmergencyJunction = activeConfig.topology === 'EMERGENCY_ROUTE' || activeConfig.topology === 'EMERGENCY_CLEARANCE';
  const isTollPlaza = activeConfig.topology === 'TOLL_PLAZA';
  const isTransitHub = activeConfig.topology === 'TRANSIT_HUB';

  return (
    <div className="rounded-2xl bg-slate-950/70 p-1 border border-white/5 shadow-2xl flex flex-col h-full">
      <div className="rounded-xl bg-slate-900/90 border border-white/5 p-4 backdrop-blur-md flex flex-col h-full space-y-3.5">
        {/* Header with Title and Sync Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '30s' }} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider text-white flex items-center gap-2 font-mono uppercase">
                Adaptive Junction Vector Simulation
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Webster model multi-phase controller with micro-simulation kinetics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* CCTV Sync Toggle Button */}
            {onToggleSync && (
              <button
                onClick={onToggleSync}
                title={syncWithCctv ? 'Synchronized with CCTV stream. Click to decouple.' : 'Decoupled view. Click to sync with CCTV.'}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border flex items-center gap-1.5 transition ${
                  syncWithCctv
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-500/10'
                    : 'bg-slate-950/80 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {syncWithCctv ? <Link className="w-3.5 h-3.5 text-cyan-400" /> : <Unlink className="w-3.5 h-3.5 text-slate-500" />}
                <span>{syncWithCctv ? 'CCTV Synced' : 'Decoupled'}</span>
              </button>
            )}

            {/* Phase State & Timer */}
            <div className="px-3 py-1 rounded-xl bg-slate-950/80 border border-white/5 text-right font-mono">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block leading-none">Phase Window</span>
              <span className="text-sm font-extrabold text-cyan-400">
                {time_remaining_sec > 0 ? `${time_remaining_sec}s` : 'HOLD'}
              </span>
            </div>
          </div>
        </div>

        {/* Area & Location Filter Controls */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Area Sector Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 uppercase font-mono flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" />
                Sector:
              </span>
              {AREAS.map((area) => (
                <button
                  key={area}
                  onClick={() => setSelectedArea(area)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition ${
                    selectedArea === area
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-500/10'
                      : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  {area === 'ALL' ? 'All' : area}
                </button>
              ))}
            </div>

            {/* Camera Selection Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
              {filteredCamList.map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => handleSelectCamera(cam.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap border transition ${
                    activeCamId === cam.id
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950/60 text-slate-400 border-white/5 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {cam.id}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Junction Details Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-white/5 text-xs font-mono">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                {activeConfig.id}
              </span>
              <span className="text-white font-medium">{activeConfig.label}</span>
              <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-white/5 text-[10px]">
                {activeConfig.area}
              </span>
            </div>

            <div className="flex items-center gap-3.5 text-slate-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                Limit: <strong className="text-slate-200">{activeConfig.speed_limit} km/h</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 text-[10px] font-bold">
                {activeConfig.topology}
              </span>
            </div>
          </div>
        </div>

        {/* 2D Canvas SVG Area */}
        <div className="relative flex-1 flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden border border-white/10 p-3 min-h-[380px] shadow-inner">
          {/* Green Corridor Glow Effect on Corridor */}
          {greenCorridor?.active && (
            <div
              className={`absolute pointer-events-none transition-all duration-700 z-10 ${
                greenCorridor.direction === 'NS'
                  ? 'w-[124px] h-full bg-emerald-500/20 border-x-2 border-emerald-400/80 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-pulse'
                  : 'h-[124px] w-full bg-emerald-500/20 border-y-2 border-emerald-400/80 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-pulse'
              }`}
            />
          )}

          <svg viewBox="0 0 500 500" className="w-full h-full max-w-[480px] max-h-[480px] drop-shadow-2xl">
            <defs>
              <pattern id="tacticalGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>
              <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Ground / Grass / Surrounding terrain */}
            <rect x="0" y="0" width="500" height="500" fill="#050811" />
            <rect x="0" y="0" width="500" height="500" fill="url(#tacticalGrid)" />

            {/* North-South Road Asphalt */}
            <rect x={cx - halfRoad} y="0" width={roadWidth} height="500" fill="#0f172a" />
            {/* East-West Road Asphalt */}
            <rect x="0" y={cy - halfRoad} width="500" height={roadWidth} fill="#0f172a" />

            {/* Intersection Center Box */}
            <rect x={cx - halfRoad} y={cy - halfRoad} width={roadWidth} height={roadWidth} fill="#131c31" />

            {/* Special Topology Markings */}
            {/* 1. Emergency Hospital Corridor Markings */}
            {isEmergencyJunction && (
              <g opacity="0.8">
                <rect x={cx - 18} y={cy - 18} width="36" height="36" rx="6" fill="#020617" stroke="#ef4444" strokeWidth="2" />
                <rect x={cx - 3.5} y={cy - 12} width="7" height="24" fill="#ef4444" rx="1.5" />
                <rect x={cx - 12} y={cy - 3.5} width="24" height="7" fill="#ef4444" rx="1.5" />
                {/* North approach emergency clearance chevrons */}
                <line x1={cx - 22} y1="70" x2={cx} y2="52" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="5,5" />
                <line x1={cx} y1="52" x2={cx + 22} y2="70" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="5,5" />
                <line x1={cx - 22} y1="110" x2={cx} y2="92" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="5,5" />
                <line x1={cx} y1="92" x2={cx + 22} y2="110" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="5,5" />
              </g>
            )}

            {/* 2. Toll Plaza Barrier Markings */}
            {isTollPlaza && (
              <g opacity="0.85">
                <rect x={cx - halfRoad} y="130" width={roadWidth} height="10" fill="#f59e0b" rx="2" />
                <text x={cx} y="137.5" fill="#000000" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">TOLL GANTRY</text>
                <line x1={cx - 25} y1="120" x2={cx - 25} y2="150" stroke="#ffffff" strokeWidth="2.5" />
                <line x1={cx + 25} y1="120" x2={cx + 25} y2="150" stroke="#ffffff" strokeWidth="2.5" />
              </g>
            )}

            {/* 3. Transit Hub Bus Lane Markings */}
            {isTransitHub && (
              <g opacity="0.7">
                <rect x={cx + 6} y="0" width={halfRoad - 6} height={cy - halfRoad} fill="#f59e0b" fillOpacity="0.15" />
                <text x={cx + 30} y="90" fill="#f59e0b" fontSize="9" fontWeight="bold" textAnchor="middle" transform={`rotate(90, ${cx + 30}, 90)`} fontFamily="monospace">
                  BUS CORRIDOR
                </text>
              </g>
            )}

            {/* Road Curb Borders */}
            <line x1={cx - halfRoad} y1="0" x2={cx - halfRoad} y2={cy - halfRoad} stroke="#334155" strokeWidth="2.5" />
            <line x1={cx + halfRoad} y1="0" x2={cx + halfRoad} y2={cy - halfRoad} stroke="#334155" strokeWidth="2.5" />
            <line x1={cx - halfRoad} y1={cy + halfRoad} x2={cx - halfRoad} y2="500" stroke="#334155" strokeWidth="2.5" />
            <line x1={cx + halfRoad} y1={cy + halfRoad} x2={cx + halfRoad} y2="500" stroke="#334155" strokeWidth="2.5" />

            <line x1="0" y1={cy - halfRoad} x2={cx - halfRoad} y2={cy - halfRoad} stroke="#334155" strokeWidth="2.5" />
            <line x1="0" y1={cy + halfRoad} x2={cx - halfRoad} y2={cy + halfRoad} stroke="#334155" strokeWidth="2.5" />
            <line x1={cx + halfRoad} y1={cy - halfRoad} x2="500" y2={cy - halfRoad} stroke="#334155" strokeWidth="2.5" />
            <line x1={cx + halfRoad} y1={cy + halfRoad} x2="500" y2={cy + halfRoad} stroke="#334155" strokeWidth="2.5" />

            {/* Center Dividers (Dashed White Lines) */}
            <line x1={cx} y1="0" x2={cx} y2={cy - halfRoad - 20} stroke="#64748b" strokeWidth="2" strokeDasharray="12,12" />
            <line x1={cx} y1={cy + halfRoad + 20} x2={cx} y2="500" stroke="#64748b" strokeWidth="2" strokeDasharray="12,12" />
            <line x1="0" y1={cy} x2={cx - halfRoad - 20} y2={cy} stroke="#64748b" strokeWidth="2" strokeDasharray="12,12" />
            <line x1={cx + halfRoad + 20} y1={cy} x2="500" y2={cy} stroke="#64748b" strokeWidth="2" strokeDasharray="12,12" />

            {/* Stop Lines with dynamic glowing status */}
            <line
              x1={cx - halfRoad}
              y1={cy - halfRoad - 6}
              x2={cx}
              y2={cy - halfRoad - 6}
              stroke={ns_light === 'RED' ? '#f43f5e' : '#10b981'}
              strokeWidth="5"
              filter={ns_light === 'RED' ? 'url(#glowRed)' : 'url(#glowGreen)'}
            />
            <line
              x1={cx}
              y1={cy + halfRoad + 6}
              x2={cx + halfRoad}
              y2={cy + halfRoad + 6}
              stroke={ns_light === 'RED' ? '#f43f5e' : '#10b981'}
              strokeWidth="5"
              filter={ns_light === 'RED' ? 'url(#glowRed)' : 'url(#glowGreen)'}
            />
            <line
              x1={cx - halfRoad - 6}
              y1={cy}
              x2={cx - halfRoad - 6}
              y2={cy + halfRoad}
              stroke={ew_light === 'RED' ? '#f43f5e' : '#10b981'}
              strokeWidth="5"
              filter={ew_light === 'RED' ? 'url(#glowRed)' : 'url(#glowGreen)'}
            />
            <line
              x1={cx + halfRoad + 6}
              y1={cy - halfRoad}
              x2={cx + halfRoad + 6}
              y2={cy}
              stroke={ew_light === 'RED' ? '#f43f5e' : '#10b981'}
              strokeWidth="5"
              filter={ew_light === 'RED' ? 'url(#glowRed)' : 'url(#glowGreen)'}
            />

            {/* Directional Approach Street Name Labels */}
            <g>
              <text x={cx} y="22" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                NORTH: {activeConfig.approaches.N.toUpperCase()}
              </text>
              <text x={cx} y="490" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                SOUTH: {activeConfig.approaches.S.toUpperCase()}
              </text>

              <g transform={`translate(22, ${cy}) rotate(-90)`}>
                <text x="0" y="0" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  WEST: {activeConfig.approaches.W.toUpperCase()}
                </text>
              </g>
              <g transform={`translate(478, ${cy}) rotate(90)`}>
                <text x="0" y="0" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  EAST: {activeConfig.approaches.E.toUpperCase()}
                </text>
              </g>
            </g>

            {/* Circular Speed Limit Badge */}
            <g transform="translate(445, 445)">
              <circle cx="0" cy="0" r="18" fill="#ffffff" stroke="#ef4444" strokeWidth="4" />
              <text x="0" y="5" fill="#0f172a" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="monospace">
                {activeConfig.speed_limit}
              </text>
            </g>

            {/* Vehicles Rendering */}
            {activeVehicles.map((v) => {
              const { x, y, rot } = getVehiclePos(v);
              const isAmbulance = v.is_emergency;
              const w = isAmbulance ? 16 : (v.type === 'truck' || v.type === 'bus' ? 17 : 14);
              const h = isAmbulance ? 28 : (v.type === 'truck' || v.type === 'bus' ? 36 : 24);

              return (
                <g key={v.id} transform={`translate(${x}, ${y}) rotate(${rot})`}>
                  {isAmbulance ? (
                    <g>
                      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="3" fill="#ffffff" stroke="#ef4444" strokeWidth="2" />
                      <rect x="-2" y="-7" width="4" height="14" fill="#ef4444" />
                      <rect x="-7" y="-2" width="14" height="4" fill="#ef4444" />
                      <circle cx="0" cy={-h / 2 + 5} r="3.5" fill="#38bdf8" className="animate-ping" />
                    </g>
                  ) : (
                    <g>
                      <rect
                        x={-w / 2}
                        y={-h / 2}
                        width={w}
                        height={h}
                        rx="3"
                        fill={v.stopped ? '#dc2626' : (v.type === 'motorcycle' ? '#10b981' : '#0284c7')}
                        stroke="#020617"
                        strokeWidth="1.5"
                      />
                      {/* Vehicle Windshield */}
                      <rect x={-w / 2 + 2} y={-h / 2 + 5} width={w - 4} height="5" rx="1" fill="#020617" />
                      {/* Headlights */}
                      <circle cx={-w / 2 + 3} cy={-h / 2 + 1} r="1" fill="#fef08a" />
                      <circle cx={w / 2 - 3} cy={-h / 2 + 1} r="1" fill="#fef08a" />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Traffic Light Signal Heads Overlays */}
          {/* North-South Signal Light */}
          <div
            role="region"
            aria-label={`North-South Signal: ${ns_light}, Queue ${queues.north_south}`}
            className="absolute top-4 right-4 bg-slate-950/95 border border-white/10 p-2.5 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md"
          >
            <div>
              <div className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">NS Corridor</div>
              <div className="text-xs font-mono font-semibold text-white">
                Queue: <span className="text-cyan-400">{queues.north_south}</span>
              </div>
              {colorblindMode && (
                <div className="text-[10px] font-bold text-amber-300 font-mono mt-0.5">{ns_light}</div>
              )}
            </div>
            <div className="flex gap-1.5 p-1 rounded-lg bg-slate-900 border border-white/10">
              <div
                title="Red (Stop)"
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${getLightBg(ns_light, 'RED')}`}
              >
                {colorblindMode ? 'X' : ''}
              </div>
              <div
                title="Yellow (Caution)"
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${getLightBg(ns_light, 'YELLOW')}`}
              >
                {colorblindMode ? '!' : ''}
              </div>
              <div
                title="Green (Go)"
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${getLightBg(ns_light, 'GREEN')}`}
              >
                {colorblindMode ? '>' : ''}
              </div>
            </div>
          </div>

          {/* East-West Signal Light */}
          <div
            role="region"
            aria-label={`East-West Signal: ${ew_light}, Queue ${queues.east_west}`}
            className="absolute bottom-4 left-4 bg-slate-950/95 border border-white/10 p-2.5 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md"
          >
            <div>
              <div className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">EW Corridor</div>
              <div className="text-xs font-mono font-semibold text-white">
                Queue: <span className="text-cyan-400">{queues.east_west}</span>
              </div>
              {colorblindMode && (
                <div className="text-[10px] font-bold text-amber-300 font-mono mt-0.5">{ew_light}</div>
              )}
            </div>
            <div className="flex gap-1.5 p-1 rounded-lg bg-slate-900 border border-white/10">
              <div
                title="Red (Stop)"
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${getLightBg(ew_light, 'RED')}`}
              >
                {colorblindMode ? 'X' : ''}
              </div>
              <div
                title="Yellow (Caution)"
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${getLightBg(ew_light, 'YELLOW')}`}
              >
                {colorblindMode ? '!' : ''}
              </div>
              <div
                title="Green (Go)"
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${getLightBg(ew_light, 'GREEN')}`}
              >
                {colorblindMode ? '>' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Junction Footer */}
        <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono gap-2">
          <div className="flex items-center gap-2">
            <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active Phase: <strong className="text-white">{current_phase}</strong></span>
            <span className="text-slate-600">|</span>
            <span>Target: <strong className="text-cyan-400">{activeConfig.id}</strong></span>
          </div>
          <div className="text-slate-500 text-[11px]">
            Webster Delay Optimization Model ({activeConfig.area})
          </div>
        </div>
      </div>
    </div>
  );
}
