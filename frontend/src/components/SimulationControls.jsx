import React, { useState } from 'react';
import {
  Sliders,
  Siren,
  Cpu,
  Gauge,
  MapPin,
  Link,
  Unlink,
  CheckCircle2,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  Footprints,
  UserCheck
} from 'lucide-react';

const DEFAULT_CAMERAS = [
  {
    id: 'CAM-01',
    label: 'Highway 101 Inflow',
    area: 'North Expressway',
    limit: 70,
    approaches: {
      N: 'Expressway Inflow North',
      S: 'Highway 101 Bypass South',
      E: 'Service Connector East',
      W: 'Outer Ring Road West'
    }
  },
  {
    id: 'CAM-02',
    label: 'Express Toll Plaza',
    area: 'North Expressway',
    limit: 60,
    approaches: {
      N: 'Toll Gantry North',
      S: 'Toll Plaza South',
      E: 'Fastag Feeder East',
      W: 'Weigh Lane West'
    }
  },
  {
    id: 'CAM-03',
    label: 'Central 4-Way Junction',
    area: 'Downtown Commercial',
    limit: 50,
    approaches: {
      N: 'Broadway Blvd North',
      S: 'Market St South',
      E: '5th Ave East',
      W: 'Commerce Way West'
    }
  },
  {
    id: 'CAM-04',
    label: 'Main Ave Transit Hub',
    area: 'Downtown Commercial',
    limit: 40,
    approaches: {
      N: 'Metro Busway North',
      S: 'Central Terminal South',
      E: 'Tram Route East',
      W: 'City Corridor West'
    }
  },
  {
    id: 'CAM-05',
    label: 'East Boulevard Inflow',
    area: 'Tech Park Corridor',
    limit: 60,
    approaches: {
      N: 'Innovation Way North',
      S: 'Silicon Pkwy South',
      E: 'Campus Bypass East',
      W: 'Research Ring West'
    }
  },
  {
    id: 'CAM-06',
    label: 'West Metro Interchange',
    area: 'Tech Park Corridor',
    limit: 45,
    approaches: {
      N: 'Overpass Inflow North',
      S: 'Underpass Outflow South',
      E: 'Metro Link East',
      W: 'Station Access West'
    }
  },
  {
    id: 'CAM-07',
    label: 'Trauma Center Emergency Gate',
    area: 'Hospital Green Route',
    limit: 50,
    approaches: {
      N: 'Ambulance Bay North',
      S: 'Emergency Clinic South',
      E: 'Helipad Corridor East',
      W: 'Triage Access West'
    }
  },
  {
    id: 'CAM-08',
    label: 'Green Route Clearance Sensor',
    area: 'Hospital Green Route',
    limit: 50,
    approaches: {
      N: 'Hospital Expwy North',
      S: 'Rapid Transit South',
      E: 'Trauma Link East',
      W: 'Perimeter Loop West'
    }
  }
];

export default function SimulationControls({
  currentMode = 'ADAPTIVE',
  currentDensity = 'MEDIUM',
  onUpdateSettings,
  onTriggerPreemption,
  onTriggerPedestrian,
  selectedCamId = 'CAM-01',
  onSelectCam,
  junctions = {},
  cameras = [],
  syncWithCctv = true,
  onToggleSync
}) {
  const [scope, setScope] = useState('camera');
  const [direction, setDirection] = useState('NS');
  const [loadingPreempt, setLoadingPreempt] = useState(false);
  const [loadingPedestrian, setLoadingPedestrian] = useState(false);

  const activeCamId = selectedCamId || 'CAM-01';

  const defaultMeta = DEFAULT_CAMERAS.find((c) => c.id === activeCamId) || DEFAULT_CAMERAS[0];
  const approaches = defaultMeta.approaches || {
    N: 'North Inflow',
    S: 'South Inflow',
    E: 'East Inflow',
    W: 'West Inflow'
  };

  const currentJunction = junctions[activeCamId];
  const junctionMode = (scope === 'camera' && currentJunction?.signals?.mode) ? currentJunction.signals.mode : currentMode;
  const junctionDensity = (scope === 'camera' && currentJunction?.metrics?.traffic_density) ? currentJunction.metrics.traffic_density : currentDensity;

  const handleModeChange = (newMode) => {
    if (onUpdateSettings) {
      onUpdateSettings({
        mode: newMode,
        cam: scope === 'all' ? null : activeCamId
      });
    }
  };

  const handleDensityChange = (newDensity) => {
    if (onUpdateSettings) {
      onUpdateSettings({
        density: newDensity,
        cam: scope === 'all' ? null : activeCamId
      });
    }
  };

  const handlePreempt = async () => {
    setLoadingPreempt(true);
    try {
      if (onTriggerPreemption) {
        await onTriggerPreemption(direction, scope === 'all' ? null : activeCamId);
      }
    } finally {
      setTimeout(() => setLoadingPreempt(false), 800);
    }
  };

  const handlePedestrian = async () => {
    setLoadingPedestrian(true);
    try {
      if (onTriggerPedestrian) {
        await onTriggerPedestrian(direction === 'NS' ? 'N' : 'E', scope === 'all' ? null : activeCamId);
      }
    } finally {
      setTimeout(() => setLoadingPedestrian(false), 800);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-950/70 p-1 border border-white/5 shadow-2xl flex flex-col justify-between h-full space-y-4">
      <div className="rounded-xl bg-slate-900/90 border border-white/5 p-4 backdrop-blur-md flex flex-col justify-between h-full space-y-4">
        <div className="space-y-3.5">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Sliders className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-wider text-white font-mono uppercase">
                  Adaptive Controller & Scenario Dock
                </h2>
                <p className="text-[11px] text-slate-400 font-mono">
                  Manual overrides and automated neural loop parameters
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Sync CCTV Button */}
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

              {/* Scope Toggle: Per-Camera vs Global Fleet */}
              <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-white/5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setScope('camera')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    scope === 'camera'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Target Cam
                </button>
                <button
                  type="button"
                  onClick={() => setScope('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    scope === 'all'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Global (8)
                </button>
              </div>
            </div>
          </div>

          {/* Active Target Banner */}
          <div className="flex items-center justify-between text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-950/60 border border-white/5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target: <strong className="text-white">{scope === 'all' ? 'All 8 Municipal Intersections' : `${activeCamId} (${defaultMeta.label})`}</strong></span>
            </span>
            <span className="text-[11px] text-cyan-400 font-bold">
              {scope === 'all' ? '8 JUNCTIONS LINKED' : `${defaultMeta.area}`}
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300 font-medium flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Optimization Mode:</span>
              </span>
              <span className="text-[11px] text-cyan-400 font-mono">
                {junctionMode === 'ADAPTIVE' ? 'DQN & Webster AI Loop' : 'Fixed 30s Cycles'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <button
                type="button"
                onClick={() => handleModeChange('ADAPTIVE')}
                className={`p-2.5 rounded-xl border text-left transition ${
                  junctionMode === 'ADAPTIVE'
                    ? 'bg-cyan-500/15 border-cyan-500/60 shadow-md shadow-cyan-500/10 text-white'
                    : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                <div className="text-xs font-bold text-cyan-300 flex items-center justify-between">
                  <span>ADAPTIVE</span>
                  {junctionMode === 'ADAPTIVE' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Real-time dynamic splits based on queue weights</div>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('FIXED')}
                className={`p-2.5 rounded-xl border text-left transition ${
                  junctionMode === 'FIXED'
                    ? 'bg-amber-500/15 border-amber-500/60 shadow-md shadow-amber-500/10 text-white'
                    : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                <div className="text-xs font-bold text-amber-300 flex items-center justify-between">
                  <span>FIXED (BASELINE)</span>
                  {junctionMode === 'FIXED' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Fixed 30s cycles for benchmarking comparison</div>
              </button>
            </div>
          </div>

          {/* Traffic Density Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300 font-medium flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulated Inflow Demand:</span>
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">
                {junctionDensity.replace('_', ' ')}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2 font-mono">
              {[
                { id: 'LOW', label: 'OFF-PEAK', desc: '12 vpm' },
                { id: 'MEDIUM', label: 'NOMINAL', desc: '28 vpm' },
                { id: 'RUSH_HOUR', label: 'RUSH HOUR', desc: '54 vpm' }
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleDensityChange(d.id)}
                  className={`p-2 rounded-xl border text-center transition ${
                    junctionDensity === d.id
                      ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-bold">{d.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Scenario Actions: Emergency & Pedestrian Crosswalk */}
        <div className="space-y-3">
          {/* Corridor Selection Axis */}
          <div className="space-y-1.5 text-xs font-mono">
            <div className="text-[11px] text-slate-400">Select Corridor Axis for Preemption & Walk Request:</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDirection('NS')}
                className={`p-2.5 rounded-lg border text-left transition ${
                  direction === 'NS'
                    ? 'bg-cyan-500/20 border-cyan-500/60 text-white shadow-sm'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                }`}
              >
                <div className="font-bold text-cyan-300 flex items-center justify-between">
                  <span>North-South Axis</span>
                  {direction === 'NS' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">
                  {approaches.N} to {approaches.S}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDirection('EW')}
                className={`p-2.5 rounded-lg border text-left transition ${
                  direction === 'EW'
                    ? 'bg-cyan-500/20 border-cyan-500/60 text-white shadow-sm'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                }`}
              >
                <div className="font-bold text-cyan-300 flex items-center justify-between">
                  <span>East-West Axis</span>
                  {direction === 'EW' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">
                  {approaches.E} to {approaches.W}
                </div>
              </button>
            </div>
          </div>

          {/* Action Trigger Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* 1. Emergency Preemption Button */}
            <button
              type="button"
              onClick={handlePreempt}
              disabled={loadingPreempt}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-[0.99] text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 border border-rose-400/40 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              <Siren className="w-4 h-4 text-white animate-bounce shrink-0" />
              <span className="truncate">
                {loadingPreempt ? 'Engaging Corridor...' : 'Ambulance Preempt (A)'}
              </span>
            </button>

            {/* 2. Pedestrian Crosswalk Request Button */}
            <button
              type="button"
              onClick={handlePedestrian}
              disabled={loadingPedestrian}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 active:scale-[0.99] text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-600/30 border border-cyan-400/40 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-white animate-pulse shrink-0" />
              <span className="truncate">
                {loadingPedestrian ? 'Actuating Crosswalk...' : 'Pedestrian Request (P)'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
