import SyntheticVisionFeed from './SyntheticVisionFeed';
import React, { useState } from 'react';
import {
  Video,
  Grid,
  Maximize2,
  Sliders,
  CheckSquare,
  Square,
  MapPin,
  LayoutGrid,
  Monitor,
  Activity,
  Crosshair,
  RefreshCw,
  Radio
} from 'lucide-react';

const DEFAULT_CAMERAS = [
  { id: 'CAM-01', label: 'Highway 101 Inflow', area: 'North Expressway', limit: 70, status: 'ONLINE', resolution: '1920x1080' },
  { id: 'CAM-02', label: 'Express Toll Plaza', area: 'North Expressway', limit: 60, status: 'ONLINE', resolution: '1920x1080' },
  { id: 'CAM-03', label: 'Central 4-Way Junction', area: 'Downtown Commercial', limit: 50, status: 'ONLINE', resolution: '1920x1080' },
  { id: 'CAM-04', label: 'Main Ave Transit Hub', area: 'Downtown Commercial', limit: 40, status: 'ONLINE', resolution: '1920x1080' },
  { id: 'CAM-05', label: 'East Boulevard Inflow', area: 'Tech Park Corridor', limit: 60, status: 'ONLINE', resolution: '1920x1080' },
  { id: 'CAM-06', label: 'West Metro Interchange', area: 'Tech Park Corridor', limit: 45, status: 'ONLINE', resolution: '1920x1080' },
  { id: 'CAM-07', label: 'Trauma Center Emergency Gate', area: 'Hospital Green Route', limit: 50, status: 'ONLINE', resolution: '1920x1080' },
  { id: 'CAM-08', label: 'Green Route Clearance Sensor', area: 'Hospital Green Route', limit: 50, status: 'ONLINE', resolution: '1920x1080' }
];

const AREAS = [
  'ALL',
  'North Expressway',
  'Downtown Commercial',
  'Tech Park Corridor',
  'Hospital Green Route'
];

export default function CctvStreamView({ onSettingChange, cameras = DEFAULT_CAMERAS, selectedCamId: propCamId, onSelectCam }) {
  const [internalCamId, setInternalCamId] = useState('CAM-01');
  const selectedCamId = propCamId !== undefined ? propCamId : internalCamId;
  const setSelectedCamId = (id) => {
    setInternalCamId(id);
    if (onSelectCam) onSelectCam(id);
  };
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [viewMode, setViewMode] = useState('single'); // 'single', 'quad', 'grid'
  
  // Vision layer toggles
  const [showBoxes, setShowBoxes] = useState(true);
  const [showSpeeds, setShowSpeeds] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [showLanes, setShowLanes] = useState(true);
  const [feedError, setFeedError] = useState(false);

  const activeCamList = cameras && cameras.length > 0 ? cameras : DEFAULT_CAMERAS;

  const filteredCameras = activeCamList.filter((c) => {
    if (selectedArea === 'ALL') return true;
    return c.area === selectedArea;
  });

  const selectedCam = activeCamList.find((c) => c.id === selectedCamId) || activeCamList[0];

  const toggleSetting = (key, val, setter) => {
    setter(!val);
    if (onSettingChange) {
      onSettingChange({ [key]: !val, cam: selectedCamId });
    }
  };

  return (
    <div className="rounded-2xl bg-slate-950/70 p-1 border border-white/5 shadow-2xl flex flex-col h-full">
      <div className="rounded-xl bg-slate-900/90 border border-white/5 p-4 backdrop-blur-md flex flex-col h-full space-y-3.5">
        {/* Top Header & View Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping absolute" />
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider text-white flex items-center gap-2 font-mono uppercase">
                <Video className="w-4 h-4 text-cyan-400" />
                Optical Telemetry & Computer Vision Stream
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Real-time neural detection pipeline at 30 FPS with low-latency telemetry
              </p>
            </div>
          </div>

          {/* View Mode Buttons (Single, Quad 2x2, Grid) */}
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-white/5 text-xs">
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition ${
                viewMode === 'single'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="Single Focused Camera"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Focused</span>
            </button>

            <button
              onClick={() => setViewMode('quad')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition ${
                viewMode === 'quad'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="Quad 2x2 Multi-Camera Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Quad 2x2</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition ${
                viewMode === 'grid'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="All Cameras Grid Wall"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>All Sectors</span>
            </button>
          </div>
        </div>

        {/* Area / Sector Filter Tabs & Camera Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
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
                {area === 'ALL' ? 'All Sectors' : area}
              </button>
            ))}
          </div>

          {/* Camera Selector Pill Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
            {filteredCameras.map((cam) => (
              <button
                key={cam.id}
                onClick={() => {
                  setSelectedCamId(cam.id);
                  setFeedError(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap border transition ${
                  selectedCamId === cam.id
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950/60 text-slate-400 border-white/5 hover:border-white/20 hover:text-white'
                }`}
              >
                {cam.id}
              </button>
            ))}
          </div>
        </div>

        {/* --- VIEW MODE 1: SINGLE FOCUSED CAMERA --- */}
        {viewMode === 'single' && (
          <div className="space-y-3">
            {/* Active Camera Telemetry Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-white/5 text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                  {selectedCam.id}
                </span>
                <span className="text-white font-medium">{selectedCam.label}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-white/5 text-[10px]">
                  {selectedCam.area}
                </span>
              </div>
              <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                <span>Speed Limit: <strong className="text-slate-200">{selectedCam.limit} km/h</strong></span>
                <span>Native: <strong className="text-slate-200">{selectedCam.resolution}</strong></span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {selectedCam.status}
                </span>
              </div>
            </div>

            {/* Main Video Stream Frame with Tactical HUD Overlays */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-white/10 flex items-center justify-center min-h-[340px] lg:min-h-[420px] shadow-inner group">
              {/* Tactical Corner HUD Reticles */}
              <div className="absolute top-3 left-3 z-20 pointer-events-none text-cyan-400/70 font-mono text-[10px] flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-sm px-2 py-0.5 rounded border border-white/5">
                <Crosshair className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span>REC // CAM-SYS ACTIVE</span>
              </div>

              <div className="absolute top-3 right-3 z-20 pointer-events-none text-emerald-400/90 font-mono text-[10px] flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-sm px-2 py-0.5 rounded border border-white/5">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>LINK: STABLE (98.4%)</span>
              </div>

              <div className="absolute bottom-3 left-3 z-20 pointer-events-none text-slate-400 font-mono text-[10px] bg-slate-950/70 backdrop-blur-sm px-2 py-0.5 rounded border border-white/5 flex items-center gap-2">
                <span>FPS: <strong className="text-cyan-400">29.97</strong></span>
                <span>LATENCY: <strong className="text-emerald-400">18ms</strong></span>
              </div>

              {/* Four Corner Crosshair Accents */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400/40 pointer-events-none z-10" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400/40 pointer-events-none z-10" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400/40 pointer-events-none z-10" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400/40 pointer-events-none z-10" />

              {!feedError ? (
                <img
                  key={selectedCam.id}
                  src={`/api/video/feed?cam=${selectedCam.id}`}
                  alt={`${selectedCam.id} Live Feed`}
                  className="w-full h-auto object-cover rounded-xl"
                  onError={() => setFeedError(true)}
                />
              ) : (
                <div className="relative w-full h-auto">
                  <SyntheticVisionFeed
                    camera={selectedCam}
                    showBoxes={showBoxes}
                    showSpeeds={showSpeeds}
                    showTrails={showTrails}
                    showLanes={showLanes}
                  />
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 backdrop-blur-md">
                    SYNTHETIC TELEMETRY // CONNECT LOCAL BACKEND FOR CCTV HARDWARE
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- VIEW MODE 2: QUAD MULTI-CAMERA 2x2 MATRIX --- */}
        {viewMode === 'quad' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredCameras.slice(0, 4).map((cam) => (
              <div
                key={cam.id}
                onClick={() => {
                  setSelectedCamId(cam.id);
                  setViewMode('single');
                }}
                className="group relative rounded-xl overflow-hidden bg-slate-950 border border-white/10 hover:border-cyan-500/60 cursor-pointer transition shadow-lg"
              >
                {/* Camera Header Banner */}
                <div className="absolute top-2 left-2 z-10 bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-mono text-slate-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <strong className="text-cyan-400">{cam.id}</strong>: {cam.label}
                </div>

                {/* Area Badge */}
                <div className="absolute top-2 right-2 z-10 bg-slate-900/90 backdrop-blur px-2 py-0.5 rounded border border-white/10 text-[9px] text-slate-400 font-mono">
                  {cam.area}
                </div>

                {/* MJPEG Stream Tile */}
                <div className="aspect-video flex items-center justify-center bg-slate-950">
                  <img
                    src={`/api/video/feed?cam=${cam.id}`}
                    alt={cam.label}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Bottom Hover Focus Overlay */}
                <div className="absolute inset-0 bg-cyan-950/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition pointer-events-none backdrop-blur-[2px]">
                  <span className="px-3.5 py-1.5 rounded-lg bg-slate-900/95 border border-cyan-400 text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5 shadow-xl">
                    <Maximize2 className="w-3.5 h-3.5" /> Focus Viewport
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- VIEW MODE 3: ALL SECTORS GRID WALL --- */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredCameras.map((cam) => (
              <div
                key={cam.id}
                onClick={() => {
                  setSelectedCamId(cam.id);
                  setViewMode('single');
                }}
                className="group rounded-xl overflow-hidden bg-slate-950 border border-white/10 hover:border-cyan-500/60 cursor-pointer transition p-2.5 space-y-2 shadow-md hover:shadow-cyan-500/10"
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-cyan-400 px-1 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/20">
                    {cam.id}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{cam.area}</span>
                </div>

                <div className="aspect-video rounded-lg overflow-hidden bg-slate-900 relative">
                  <img
                    src={`/api/video/feed?cam=${cam.id}`}
                    alt={cam.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1.5 left-1.5 bg-slate-950/90 px-1.5 py-0.5 rounded text-[9px] text-slate-300 font-mono border border-white/5">
                    {cam.limit} km/h
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 truncate font-medium">
                  {cam.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vision Overlay Controls */}
        <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium">Neural Layer Overlays ({selectedCam.id}):</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => toggleSetting('show_boxes', showBoxes, setShowBoxes)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border flex items-center gap-1.5 transition ${
                showBoxes
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/10'
                  : 'bg-slate-950/60 border-white/5 text-slate-500 hover:text-slate-400'
              }`}
            >
              {showBoxes ? <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> : <Square className="w-3.5 h-3.5 text-slate-500" />}
              Bounding Boxes
            </button>

            <button
              onClick={() => toggleSetting('show_speeds', showSpeeds, setShowSpeeds)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border flex items-center gap-1.5 transition ${
                showSpeeds
                  ? 'bg-blue-500/15 border-blue-500/40 text-blue-300 shadow-sm shadow-blue-500/10'
                  : 'bg-slate-950/60 border-white/5 text-slate-500 hover:text-slate-400'
              }`}
            >
              {showSpeeds ? <CheckSquare className="w-3.5 h-3.5 text-blue-400" /> : <Square className="w-3.5 h-3.5 text-slate-500" />}
              Velocity Tags
            </button>

            <button
              onClick={() => toggleSetting('show_trajectories', showTrails, setShowTrails)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border flex items-center gap-1.5 transition ${
                showTrails
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10'
                  : 'bg-slate-950/60 border-white/5 text-slate-500 hover:text-slate-400'
              }`}
            >
              {showTrails ? <CheckSquare className="w-3.5 h-3.5 text-amber-400" /> : <Square className="w-3.5 h-3.5 text-slate-500" />}
              Trajectories
            </button>

            <button
              onClick={() => toggleSetting('show_lanes', showLanes, setShowLanes)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border flex items-center gap-1.5 transition ${
                showLanes
                  ? 'bg-purple-500/15 border-purple-500/40 text-purple-300 shadow-sm shadow-purple-500/10'
                  : 'bg-slate-950/60 border-white/5 text-slate-500 hover:text-slate-400'
              }`}
            >
              {showLanes ? <CheckSquare className="w-3.5 h-3.5 text-purple-400" /> : <Square className="w-3.5 h-3.5 text-slate-500" />}
              Lane Geometry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
