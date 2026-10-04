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
  ArrowRight
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
  selectedCamId = 'CAM-01',
  onSelectCam,
  junctions = {},
  cameras = [],
  syncWithCctv = true,
  onToggleSync
}) {
  const [scope, setScope] = useState('camera'); // 'camera' or 'all'
  const [direction, setDirection] = useState('NS');
  const [loadingPreempt, setLoadingPreempt] = useState(false);

  const activeCamId = selectedCamId || 'CAM-01';

  // Get active camera details
  const activeCameraMeta = (cameras && cameras.length > 0 ? cameras : DEFAULT_CAMERAS).find(
    (c) => c.id === activeCamId
  ) || DEFAULT_CAMERAS[0];

  const defaultMeta = DEFAULT_CAMERAS.find((c) => c.id === activeCamId) || DEFAULT_CAMERAS[0];
  const approaches = defaultMeta.approaches || {
    N: 'North Approach',
    S: 'South Approach',
    E: 'East Approach',
    W: 'West Approach'
  };

  // Junction state for active camera
  const jState = junctions[activeCamId];
  const activeMode = scope === 'all'
    ? currentMode
    : (jState?.signals?.mode || currentMode);

  const activeDensityVal = scope === 'all'
    ? currentDensity
    : (jState?.metrics?.traffic_density || currentDensity);

  const activeQueues = jState?.signals?.queues || { north_south: 0, east_west: 0 };

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
                  All Cams
                </button>
              </div>
            </div>
          </div>

          {/* Camera Selector Strip & Active Metadata */}
          <div className="space-y-2">
            {scope === 'camera' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    Target Location:
                  </span>
                  <span className="text-[11px] text-cyan-400">
                    {activeCameraMeta.area || defaultMeta.area}
                  </span>
                </div>

                {/* Camera Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
                  {DEFAULT_CAMERAS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onSelectCam && onSelectCam(c.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap border transition ${
                        activeCamId === c.id
                          ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-950/60 text-slate-400 border-white/5 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {c.id}
                    </button>
                  ))}
                </div>

                {/* Active Location Info Pill */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-white/5 text-xs font-mono">
                  <div className="truncate">
                    <strong className="text-cyan-400">{activeCamId}:</strong>{' '}
                    <span className="text-white font-medium">{activeCameraMeta.label || defaultMeta.label}</span>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0 text-[11px] text-slate-400">
                    <span>Queues: <strong className="text-cyan-300">NS {activeQueues.north_south} | EW {activeQueues.east_west}</strong></span>
                    <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-200 border border-white/5">
                      {defaultMeta.limit} km/h
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs font-mono text-purple-200 flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium">
                  <Layers className="w-4 h-4 text-purple-400" />
                  Global Fleet Override: Commands apply to all 8 municipal intersections
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 text-[10px] font-bold border border-purple-500/30">
                  8 CAMERAS
                </span>
              </div>
            )}
          </div>

          {/* Controller Mode Toggle */}
          <div>
            <label className="text-xs font-mono text-slate-400 flex items-center justify-between mb-2">
              <span>Optimization Algorithm {scope === 'camera' ? `(${activeCamId})` : '(Fleet)'}</span>
              <span className="text-[11px] text-cyan-400">
                {activeMode === 'ADAPTIVE' ? 'Deep Q-Network + Webster Delay Optimization' : 'Static Fixed 30s Baseline'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => handleModeChange('ADAPTIVE')}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition ${
                  activeMode === 'ADAPTIVE'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>Adaptive Neural Loop</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('FIXED')}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition ${
                  activeMode === 'FIXED'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Gauge className="w-4 h-4" />
                <span>Fixed 30s Baseline</span>
              </button>
            </div>
          </div>

          {/* Traffic Density Selector */}
          <div>
            <label className="text-xs font-mono text-slate-400 flex items-center justify-between mb-2">
              <span>Simulated Inflow Demand {scope === 'camera' ? `(${activeCamId})` : '(Fleet)'}</span>
              <span className="text-[11px] text-purple-400 font-bold">{activeDensityVal}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'LOW', label: 'Low Flow', desc: 'Off-Peak Off-Hours' },
                { id: 'MEDIUM', label: 'Balanced Flow', desc: 'Standard Day Traffic' },
                { id: 'RUSH_HOUR', label: 'Peak Inflow', desc: 'Heavy Saturation' }
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleDensityChange(d.id)}
                  className={`p-2.5 rounded-xl text-left border transition font-mono ${
                    activeDensityVal === d.id
                      ? 'bg-purple-500/20 border-purple-500/60 text-white shadow-md shadow-purple-500/10'
                      : 'bg-slate-950/60 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">{d.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Green Corridor Trigger Section */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-rose-500/30 space-y-3 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-2 uppercase tracking-wider">
              <Siren className="w-4 h-4 text-rose-400 animate-pulse" />
              Green Corridor Emergency Preemption
            </span>
            <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-slate-900 border border-white/5">
              {scope === 'all' ? 'TARGET: ALL INTERSECTIONS' : `TARGET: ${activeCamId}`}
            </span>
          </div>

          {/* Route Selector with Camera Approach Street Names */}
          <div className="space-y-1.5 text-xs font-mono">
            <div className="text-[11px] text-slate-400">Select Rapid Dispatch Corridor:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDirection('NS')}
                className={`p-2.5 rounded-lg border text-left transition ${
                  direction === 'NS'
                    ? 'bg-rose-500/20 border-rose-500/60 text-white shadow-sm'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                }`}
              >
                <div className="font-bold text-rose-300 flex items-center justify-between">
                  <span>North-South Axis</span>
                  {direction === 'NS' && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate flex items-center gap-1">
                  <span>{approaches.N}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>{approaches.S}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDirection('EW')}
                className={`p-2.5 rounded-lg border text-left transition ${
                  direction === 'EW'
                    ? 'bg-rose-500/20 border-rose-500/60 text-white shadow-sm'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                }`}
              >
                <div className="font-bold text-rose-300 flex items-center justify-between">
                  <span>East-West Axis</span>
                  {direction === 'EW' && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate flex items-center gap-1">
                  <span>{approaches.E}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>{approaches.W}</span>
                </div>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePreempt}
            disabled={loadingPreempt}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 active:scale-[0.99] text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 border border-rose-400/40 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            <Siren className="w-4 h-4 text-white animate-bounce" />
            <span>
              {loadingPreempt
                ? 'Engaging Route Preemption Protocol...'
                : `Dispatch Emergency Corridor on ${scope === 'all' ? 'All Intersections' : activeCamId}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
