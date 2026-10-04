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
  ChevronRight,
  Footprints,
  UserCheck
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
  pedestrians = [],
  onTriggerPedestrian,
  crosswalkActive = false,
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

  const activeCamId = syncWithCctv ? selectedCamId : internalCamId;
  const activeJunction = junctions[activeCamId] || {};
  const activeConfig = DEFAULT_JUNCTION_CONFIGS[activeCamId] || DEFAULT_JUNCTION_CONFIGS['CAM-01'];

  const activeSignals = activeJunction.signals || signals || {};
  const activeVehicles = activeJunction.vehicles || vehicles || [];
  const activePedestrians = activeJunction.pedestrians || pedestrians || [];
  const isCrosswalkActive = activeJunction.crosswalk_active || crosswalkActive || activePedestrians.length > 0;

  const currentPhase = activeSignals.current_phase || 'NS_GREEN';
  const remainingTime = Math.ceil(activeSignals.time_remaining_sec || 0);
  const queues = activeSignals.queues || { north_south: 0, east_west: 0 };
  const ns_light = activeSignals.ns_light || 'GREEN';
  const ew_light = activeSignals.ew_light || 'RED';

  const isEmergencyJunction = activeConfig.topology === 'EMERGENCY_ROUTE' || activeConfig.topology === 'EMERGENCY_CLEARANCE';
  const isTollPlaza = activeConfig.topology === 'TOLL_PLAZA';
  const isTransitHub = activeConfig.topology === 'TRANSIT_HUB';

  const handleSelectCam = (id) => {
    if (syncWithCctv && onSelectCam) {
      onSelectCam(id);
    } else {
      setInternalCamId(id);
    }
  };

  const getLightBg = (actualState, colorName) => {
    const isLit = actualState === colorName;
    if (colorName === 'RED') {
      return isLit
        ? 'bg-rose-500 shadow-[0_0_14px_rgba(244,63,94,0.9)] text-white font-bold'
        : 'bg-rose-950/40 text-rose-800/40 border border-white/5';
    }
    if (colorName === 'YELLOW') {
      return isLit
        ? 'bg-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.9)] text-slate-950 font-bold'
        : 'bg-amber-950/40 text-amber-800/40 border border-white/5';
    }
    if (colorName === 'GREEN') {
      return isLit
        ? 'bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)] text-slate-950 font-bold'
        : 'bg-emerald-950/40 text-emerald-800/40 border border-white/5';
    }
    return 'bg-slate-800 text-slate-600';
  };

  const cx = 250;
  const cy = 250;
  const roadWidth = 110;
  const halfRoad = roadWidth / 2;

  const getVehiclePos = (v) => {
    const d = v.dist;
    let x = cx;
    let y = cy;
    let rot = 0;

    if (v.approach === 'N') {
      x = cx - 22;
      y = (cy - halfRoad) - d * 1.5;
      rot = 180;
    } else if (v.approach === 'S') {
      x = cx + 22;
      y = (cy + halfRoad) + d * 1.5;
      rot = 0;
    } else if (v.approach === 'E') {
      x = (cx + halfRoad) + d * 1.5;
      y = cy - 22;
      rot = 270;
    } else if (v.approach === 'W') {
      x = (cx - halfRoad) - d * 1.5;
      y = cy + 22;
      rot = 90;
    }
    return { x, y, rot };
  };

  return (
    <div className="rounded-2xl bg-slate-950/70 p-1 border border-white/5 shadow-2xl flex flex-col h-full space-y-4">
      <div className="rounded-xl bg-slate-900/90 border border-white/5 p-4 backdrop-blur-md flex flex-col justify-between h-full space-y-4">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Compass className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-wider text-white font-mono uppercase">
                  4-Way Junction Visualizer
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {activeCamId}
                </span>
                {isCrosswalkActive && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-1">
                    <Footprints className="w-3 h-3 text-amber-300" />
                    CROSSWALK ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {activeConfig.label} ({activeConfig.area}) - {activeConfig.topology}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Pedestrian Crossing Trigger Button */}
            {onTriggerPedestrian && (
              <button
                type="button"
                onClick={() => onTriggerPedestrian('N', activeCamId)}
                title="Simulate a pedestrian crossing the crosswalk (Hot-key: P)"
                className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold border border-cyan-500/40 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm shadow-cyan-500/10"
              >
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pedestrian Request (P)</span>
              </button>
            )}

            {/* Sync CCTV Toggle */}
            {onToggleSync && (
              <button
                type="button"
                onClick={onToggleSync}
                title={syncWithCctv ? 'Synchronized with active camera. Click to decouple.' : 'Decoupled. Click to sync with camera.'}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border flex items-center gap-1.5 transition ${
                  syncWithCctv
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-500/10'
                    : 'bg-slate-950/80 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {syncWithCctv ? <Link className="w-3.5 h-3.5 text-cyan-400" /> : <Unlink className="w-3.5 h-3.5 text-slate-500" />}
                <span>{syncWithCctv ? 'CCTV Synced' : 'Decoupled'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 2D Intersection Simulation Canvas */}
        <div className="relative flex items-center justify-center p-2 rounded-xl bg-slate-950/80 border border-white/5 overflow-hidden">
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

            {/* Terrain Background */}
            <rect x="0" y="0" width="500" height="500" fill="#050811" />
            <rect x="0" y="0" width="500" height="500" fill="url(#tacticalGrid)" />

            {/* North-South Road Asphalt */}
            <rect x={cx - halfRoad} y="0" width={roadWidth} height="500" fill="#0f172a" />
            {/* East-West Road Asphalt */}
            <rect x="0" y={cy - halfRoad} width="500" height={roadWidth} fill="#0f172a" />

            {/* Center Intersection Box */}
            <rect x={cx - halfRoad} y={cy - halfRoad} width={roadWidth} height={roadWidth} fill="#131c31" />

            {/* Road Borders */}
            <line x1={cx - halfRoad} y1="0" x2={cx - halfRoad} y2={cy - halfRoad} stroke="#334155" strokeWidth="2.5" />
            <line x1={cx + halfRoad} y1="0" x2={cx + halfRoad} y2={cy - halfRoad} stroke="#334155" strokeWidth="2.5" />
            <line x1={cx - halfRoad} y1={cy + halfRoad} x2={cx - halfRoad} y2="500" stroke="#334155" strokeWidth="2.5" />
            <line x1={cx + halfRoad} y1={cy + halfRoad} x2={cx + halfRoad} y2="500" stroke="#334155" strokeWidth="2.5" />

            <line x1="0" y1={cy - halfRoad} x2={cx - halfRoad} y2={cy - halfRoad} stroke="#334155" strokeWidth="2.5" />
            <line x1="0" y1={cy + halfRoad} x2={cx - halfRoad} y2={cy + halfRoad} stroke="#334155" strokeWidth="2.5" />
            <line x1={cx + halfRoad} y1={cy - halfRoad} x2="500" y2={cy - halfRoad} stroke="#334155" strokeWidth="2.5" />
            <line x1={cx + halfRoad} y1={cy + halfRoad} x2="500" y2={cy + halfRoad} stroke="#334155" strokeWidth="2.5" />

            {/* Center Dividers (Dashed White Lines) */}
            <line x1={cx} y1="0" x2={cx} y2={cy - halfRoad - 24} stroke="#64748b" strokeWidth="2" strokeDasharray="12,12" />
            <line x1={cx} y1={cy + halfRoad + 24} x2={cx} y2="500" stroke="#64748b" strokeWidth="2" strokeDasharray="12,12" />
            <line x1="0" y1={cy} x2={cx - halfRoad - 24} y2={cy} stroke="#64748b" strokeWidth="2" strokeDasharray="12,12" />
            <line x1={cx + halfRoad + 24} y1={cy} x2="500" y2={cy} stroke="#64748b" strokeWidth="2" strokeDasharray="12,12" />

            {/* ZEBRA CROSSWALK STRIPES */}
            {/* North Crosswalk */}
            <g opacity="0.9">
              {[-44, -30, -15, 0, 15, 30, 44].map((off) => (
                <rect key={`nz-${off}`} x={cx + off - 5} y={cy - halfRoad - 22} width="10" height="18" fill="#e2e8f0" rx="1" />
              ))}
            </g>
            {/* South Crosswalk */}
            <g opacity="0.9">
              {[-44, -30, -15, 0, 15, 30, 44].map((off) => (
                <rect key={`sz-${off}`} x={cx + off - 5} y={cy + halfRoad + 4} width="10" height="18" fill="#e2e8f0" rx="1" />
              ))}
            </g>
            {/* West Crosswalk */}
            <g opacity="0.9">
              {[-44, -30, -15, 0, 15, 30, 44].map((off) => (
                <rect key={`wz-${off}`} x={cx - halfRoad - 22} y={cy + off - 5} width="18" height="10" fill="#e2e8f0" rx="1" />
              ))}
            </g>
            {/* East Crosswalk */}
            <g opacity="0.9">
              {[-44, -30, -15, 0, 15, 30, 44].map((off) => (
                <rect key={`ez-${off}`} x={cx + halfRoad + 4} y={cy + off - 5} width="18" height="10" fill="#e2e8f0" rx="1" />
              ))}
            </g>

            {/* Pedestrian Signal Indicator Heads at Corner Curbs */}
            <g transform={`translate(${cx - halfRoad - 14}, ${cy - halfRoad - 14})`}>
              <rect x="0" y="0" width="12" height="12" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="1" />
              <circle cx="6" cy="6" r="3.5" fill={ns_light === 'RED' ? '#10b981' : '#f43f5e'} filter={ns_light === 'RED' ? 'url(#glowGreen)' : 'url(#glowRed)'} />
            </g>
            <g transform={`translate(${cx + halfRoad + 2}, ${cy + halfRoad + 2})`}>
              <rect x="0" y="0" width="12" height="12" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="1" />
              <circle cx="6" cy="6" r="3.5" fill={ns_light === 'RED' ? '#10b981' : '#f43f5e'} filter={ns_light === 'RED' ? 'url(#glowGreen)' : 'url(#glowRed)'} />
            </g>

            {/* Stop Lines with dynamic glowing status */}
            <line
              x1={cx - halfRoad}
              y1={cy - halfRoad - 26}
              x2={cx}
              y2={cy - halfRoad - 26}
              stroke={ns_light === 'RED' || isCrosswalkActive ? '#f43f5e' : '#10b981'}
              strokeWidth="5"
              filter={ns_light === 'RED' || isCrosswalkActive ? 'url(#glowRed)' : 'url(#glowGreen)'}
            />
            <line
              x1={cx}
              y1={cy + halfRoad + 26}
              x2={cx + halfRoad}
              y2={cy + halfRoad + 26}
              stroke={ns_light === 'RED' || isCrosswalkActive ? '#f43f5e' : '#10b981'}
              strokeWidth="5"
              filter={ns_light === 'RED' || isCrosswalkActive ? 'url(#glowRed)' : 'url(#glowGreen)'}
            />
            <line
              x1={cx - halfRoad - 26}
              y1={cy}
              x2={cx - halfRoad - 26}
              y2={cy + halfRoad}
              stroke={ew_light === 'RED' || isCrosswalkActive ? '#f43f5e' : '#10b981'}
              strokeWidth="5"
              filter={ew_light === 'RED' || isCrosswalkActive ? 'url(#glowRed)' : 'url(#glowGreen)'}
            />
            <line
              x1={cx + halfRoad + 26}
              y1={cy - halfRoad}
              x2={cx + halfRoad + 26}
              y2={cy}
              stroke={ew_light === 'RED' || isCrosswalkActive ? '#f43f5e' : '#10b981'}
              strokeWidth="5"
              filter={ew_light === 'RED' || isCrosswalkActive ? 'url(#glowRed)' : 'url(#glowGreen)'}
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

            {/* Render Pedestrians on Crosswalk */}
            {activePedestrians.map((ped) => {
              const progress = ped.progress !== undefined ? ped.progress : 0.5;
              let px = cx;
              let py = cy;

              if (ped.approach === 'N') {
                px = (cx - halfRoad + 8) + progress * (roadWidth - 16);
                py = cy - halfRoad - 13;
              } else if (ped.approach === 'S') {
                px = (cx + halfRoad - 8) - progress * (roadWidth - 16);
                py = cy + halfRoad + 13;
              } else if (ped.approach === 'E') {
                px = cx + halfRoad + 13;
                py = (cy - halfRoad + 8) + progress * (roadWidth - 16);
              } else {
                px = cx - halfRoad - 13;
                py = (cy + halfRoad - 8) - progress * (roadWidth - 16);
              }

              return (
                <g key={`ped-${ped.id}`} transform={`translate(${px}, ${py})`}>
                  <rect x="-8" y="-12" width="16" height="24" fill="none" stroke="#06b6d4" strokeWidth="1.5" rx="2" />
                  <circle cx="0" cy="-6" r="3.5" fill="#fed7aa" />
                  <rect x="-3" y="-2" width="6" height="8" fill="#06b6d4" rx="1" />
                  <rect x="-14" y="-22" width="28" height="9" fill="#020617" stroke="#06b6d4" strokeWidth="0.8" rx="2" />
                  <text x="0" y="-15.5" fill="#06b6d4" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    PED #{ped.id}
                  </text>
                </g>
              );
            })}

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
                      <circle cx="0" cy={-h / 2 + 5} r="3" fill="#ef4444" className="animate-ping" />
                    </g>
                  ) : (
                    <g>
                      <rect
                        x={-w / 2}
                        y={-h / 2}
                        width={w}
                        height={h}
                        rx="3"
                        fill={
                          v.type === 'truck'
                            ? '#8b5cf6'
                            : v.type === 'bus'
                            ? '#f59e0b'
                            : v.type === 'motorcycle'
                            ? '#10b981'
                            : '#0284c7'
                        }
                        stroke="#1e293b"
                        strokeWidth="1.5"
                      />
                      <rect x={-w / 2 + 2} y={-h / 2 + 4} width={w - 4} height={h * 0.28} fill="#0f172a" rx="1" />
                      <circle cx={-w / 2 + 3} cy={h / 2 - 2} r="1.5" fill="#fef08a" />
                      <circle cx={w / 2 - 3} cy={h / 2 - 2} r="1.5" fill="#fef08a" />
                    </g>
                  )}

                  {v.stopped && (
                    <g transform={`translate(0, ${-h / 2 - 10})`}>
                      <rect x="-14" y="-6" width="28" height="11" rx="2" fill="#0f172a" stroke="#f43f5e" strokeWidth="1" />
                      <text x="0" y="2" fill="#f43f5e" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                        STOP
                      </text>
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
              <div title="Red (Stop)" className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${getLightBg(ns_light, 'RED')}`}>
                {colorblindMode ? 'X' : ''}
              </div>
              <div title="Yellow (Caution)" className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${getLightBg(ns_light, 'YELLOW')}`}>
                {colorblindMode ? '!' : ''}
              </div>
              <div title="Green (Go)" className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${getLightBg(ns_light, 'GREEN')}`}>
                {colorblindMode ? 'O' : ''}
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
              <div title="Red (Stop)" className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${getLightBg(ew_light, 'RED')}`}>
                {colorblindMode ? 'X' : ''}
              </div>
              <div title="Yellow (Caution)" className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${getLightBg(ew_light, 'YELLOW')}`}>
                {colorblindMode ? '!' : ''}
              </div>
              <div title="Green (Go)" className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${getLightBg(ew_light, 'GREEN')}`}>
                {colorblindMode ? 'O' : ''}
              </div>
            </div>
          </div>

          {/* Phase Countdown Timer Badge */}
          <div className="absolute top-4 left-4 bg-slate-950/95 border border-white/10 p-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 backdrop-blur-md font-mono">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <div>
              <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
                {currentPhase.replace('_', ' ')}
              </div>
              <div className="text-xs font-bold text-cyan-300">
                SPLIT: <span className="text-white text-sm">{remainingTime}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Camera Selector Tabs */}
        <div className="space-y-2 pt-2 border-t border-white/5 font-mono">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Select Active Intersection Sector:</span>
            </span>
            <span className="text-[11px] text-slate-500">8 Municipal Junctions Active</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.keys(DEFAULT_JUNCTION_CONFIGS).map((id) => {
              const cfg = DEFAULT_JUNCTION_CONFIGS[id];
              const isSelected = id === activeCamId;
              return (
                <button
                  key={id}
                  onClick={() => handleSelectCam(id)}
                  className={`p-2 rounded-xl border text-left transition ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500/60 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/60 border-white/5 hover:border-white/20 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-300'}`}>
                      {id}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{cfg.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
