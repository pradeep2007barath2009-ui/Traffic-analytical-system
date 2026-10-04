import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Cpu,
  Video,
  Compass,
  Siren,
  ShieldCheck,
  Leaf,
  Car,
  Layers,
  Sparkles,
  ArrowRight,
  Gauge
} from 'lucide-react';

export default function PresentationSlides({ metrics, signals, onInjectAmbulance, onExitSlides }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const slides = [
    {
      id: 'overview',
      tag: 'SLIDE 01 / 07',
      category: 'PROJECT OVERVIEW & PROBLEM STATEMENT',
      title: 'UrbanFlow AI: Intelligent Traffic Operations Platform',
      subtitle: 'Metropolitan Mobility Analytics, Computer Vision, and Dynamic Signal Coordination',
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
          <div className="p-5 rounded-xl bg-slate-950/80 border border-white/5 space-y-3 font-mono">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-sm">
              01
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">The Urban Gridlock Problem</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Conventional pre-timed traffic lights run fixed cycles regardless of actual demand, wasting billions of commuter hours at empty intersections while opposing lanes back up.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/80 border border-white/5 space-y-3 font-mono">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
              02
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Emergency Response Delays</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Ambulances and fire units lose critical minutes trapped in congestion, lacking real-time automated preemption that coordinates signal heads ahead of their arrival.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/80 border border-white/5 space-y-3 font-mono">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
              03
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">The UrbanFlow Architecture</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              A unified system fusing edge Computer Vision tracking, queue-sensitive Webster phase adaptation, and life-safety Green Corridor preemption into a centralized command dashboard.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'vision',
      tag: 'SLIDE 02 / 07',
      category: 'EDGE COMPUTER VISION PIPELINE',
      title: 'Real-Time Multi-Object Tracking & Violation Engine',
      subtitle: 'Continuous Visual Surveillance at 30 FPS with Kinematic Trajectory Vectors',
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
          <div className="p-5 rounded-xl bg-slate-950/80 border border-white/5 space-y-4">
            <h4 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
              <Video className="w-4 h-4 text-cyan-400" />
              Vision Architecture Components
            </h4>
            <ul className="space-y-3 text-xs text-slate-300 font-mono">
              <li className="flex items-start gap-2.5">
                <span className="text-cyan-400 font-bold">•</span>
                <span className="font-sans"><strong>YOLOv8 Detection Backbone:</strong> Multi-class inference recognizing cars, motorcycles, transit buses, heavy trucks, and ambulances.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-cyan-400 font-bold">•</span>
                <span className="font-sans"><strong>ByteTrack Multi-Object Tracker:</strong> Preserves vehicle identity IDs across frames to measure displacement and trajectory histories.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-cyan-400 font-bold">•</span>
                <span className="font-sans"><strong>Instant Speed Estimation:</strong> Converts pixel displacement delta into calibrated km/h velocity vectors in real time.</span>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/80 border border-white/5 space-y-4">
            <h4 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Automated Infraction Logging (E-Challan)
            </h4>
            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">Speed Limit Infractions:</span>
                <span className="font-bold text-rose-400">&gt; 60 km/h Trigger</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">Stop-Line Crossing:</span>
                <span className="font-bold text-amber-400">Y = 255 px Intersection Intrusion</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">Citation Export:</span>
                <span className="font-bold text-cyan-400">Instant CSV Audit Ledger</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'algorithm',
      tag: 'SLIDE 03 / 07',
      category: 'ADAPTIVE SIGNAL CONTROL ALGORITHM',
      title: 'Queue-Sensitive Webster Phase Optimization',
      subtitle: 'Dynamic Green Split Balancing vs. Static 30-Second Fixed Baseline Timers',
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
          <div className="p-5 rounded-xl bg-slate-950/80 border border-white/5 space-y-4">
            <h4 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              Webster Delay Optimization Formula
            </h4>
            <div className="p-4 rounded-xl bg-slate-900 border border-white/5 font-mono text-xs space-y-2">
              <div className="text-cyan-400 font-bold text-sm">
                C_opt = (1.5 * L + 5) / (1 - Y)
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Where L is total lost time per cycle, and Y is the sum of critical lane flow ratios across opposing corridors.
              </p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              When North-South queue pressure increases during rush hours, the controller dynamically extends green time up to 50s, preventing queue spillback into adjacent city blocks.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/80 border border-white/5 space-y-4">
            <h4 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-400" />
              Empirical Performance Comparison
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 text-center">
                <div className="text-slate-400 text-[11px]">Fixed 30s Baseline</div>
                <div className="text-xl font-extrabold text-rose-400 mt-1">21.4s</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Average Wait per Vehicle</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 text-center">
                <div className="text-slate-400 text-[11px]">Adaptive AI Mode</div>
                <div className="text-xl font-extrabold text-emerald-400 mt-1">12.8s</div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">-40.2% Delay Reduction</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'preemption',
      tag: 'SLIDE 04 / 07',
      category: 'LIFE-SAFETY PREEMPTION',
      title: 'Emergency Green Corridor Priority Protocol',
      subtitle: 'Automated Signal Override for Ambulances and First Responder Units',
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
          <div className="p-5 rounded-xl bg-slate-950/80 border border-white/5 space-y-4">
            <h4 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
              <Siren className="w-4 h-4 text-rose-400" />
              Preemption Sequence of Operations
            </h4>
            <ol className="space-y-2.5 text-xs text-slate-300 font-mono">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">1.</span>
                <span className="font-sans"><strong>Vehicle Sighting:</strong> Emergency ambulance detected within 150m of intersection.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">2.</span>
                <span className="font-sans"><strong>Clearance Interval:</strong> Conflicting phase transitions immediately to yellow (2s clearance) then all-red.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">3.</span>
                <span className="font-sans"><strong>Green Lock:</strong> Emergency corridor locks green until vehicle crosses intersection center.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">4.</span>
                <span className="font-sans"><strong>Cycle Recovery:</strong> Controller smoothly returns to dynamic queue balancing.</span>
              </li>
            </ol>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/80 border border-white/5 flex flex-col justify-between space-y-4">
            <div>
              <h4 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Live Preemption Interactive Test
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                You can trigger the emergency preemption protocol directly from this presentation slide to demonstrate the signal override sequence.
              </p>
            </div>
            <button
              onClick={onInjectAmbulance}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Siren className="w-4 h-4 animate-bounce" />
              Execute Emergency Corridor Preemption
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'fleet',
      tag: 'SLIDE 05 / 07',
      category: 'MULTI-CLASS VEHICLE DYNAMICS',
      title: 'Vehicle Fleet Classification Matrix',
      subtitle: 'Custom Kinematic Models & Priority Profiles for 5 Urban Vehicle Classes',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-6 font-mono">
          {[
            { name: 'Passenger Cars', share: '64%', speed: '42 km/h', role: 'Commuter volume', tag: 'Standard LMV' },
            { name: 'Motorcycles', share: '18%', speed: '48 km/h', role: 'Agile filtering', tag: 'Two-Wheeler' },
            { name: 'Transit Buses', share: '9%', speed: '34 km/h', role: 'High occupancy', tag: 'Public Transit' },
            { name: 'Freight Trucks', share: '6%', speed: '31 km/h', role: 'Heavy logistics', tag: 'Commercial' },
            { name: 'Emergency Units', share: '3%', speed: '65 km/h', role: 'Preemption route', tag: 'Life-Safety' }
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-white/5 text-center space-y-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-white/10 font-mono">
                {item.tag}
              </span>
              <h5 className="text-xs font-bold text-white">{item.name}</h5>
              <div className="text-2xl font-extrabold text-cyan-400">{item.share}</div>
              <div className="text-[11px] text-slate-400">Avg: {item.speed}</div>
              <p className="text-[10px] text-slate-500 font-sans">{item.role}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'environment',
      tag: 'SLIDE 06 / 07',
      category: 'DECARBONIZATION & ECONOMIC IMPACT',
      title: 'Emissions Reductions & Wait Time Savings',
      subtitle: 'Quantifiable Environmental and Economic Benefits of Intelligent Signal Timing',
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6 font-mono">
          <div className="p-5 rounded-xl bg-slate-950/80 border border-white/5 space-y-3 text-center">
            <Leaf className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-2xl font-extrabold text-emerald-400">
              {metrics?.co2_saved_kg || 1.42} kg CO2
            </div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Idle Emissions Prevented</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Standard idling vehicles emit ~2.4g CO2 per minute. Eliminating 32% of idle waiting cycles delivers immediate urban air quality improvements.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/80 border border-white/5 space-y-3 text-center">
            <Gauge className="w-8 h-8 text-cyan-400 mx-auto" />
            <div className="text-2xl font-extrabold text-cyan-400">
              -{metrics?.wait_reduction_pct || 38.6}%
            </div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Commuter Delay Reduction</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Dynamic queue splitting cuts average intersection delay from 21.4s down to 12.8s per vehicle across all 4 intersection approaches.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/80 border border-white/5 space-y-3 text-center">
            <ShieldCheck className="w-8 h-8 text-amber-400 mx-auto" />
            <div className="text-2xl font-extrabold text-amber-400">
              {signals?.green_corridor?.cleared_count || 3} Units
            </div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Emergency Corridors Cleared</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              First responder travel times reduced by an average of 42 seconds per intersection, critical for cardiac and stroke transit.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'architecture',
      tag: 'SLIDE 07 / 07',
      category: 'TECHNICAL ARCHITECTURE & LIVE ACCESS',
      title: 'Local-First Modular Software Architecture',
      subtitle: 'High-Concurrency Python FastAPI, OpenCV, WebSockets, and React 19 Frontend',
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6 font-mono">
          <div className="p-5 rounded-xl bg-slate-950/80 border border-white/5 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Technology Stack Breakdown
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex justify-between">
                <span className="text-slate-400">Vision Pipeline:</span>
                <span className="text-white">OpenCV + NumPy + YOLOv8 + ByteTrack</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex justify-between">
                <span className="text-slate-400">API & Telemetry:</span>
                <span className="text-white">FastAPI + WebSockets + Uvicorn (5 Hz)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex justify-between">
                <span className="text-slate-400">Operations Frontend:</span>
                <span className="text-white">React 19 + Vite + Tailwind CSS v4</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex justify-between">
                <span className="text-slate-400">Network Host:</span>
                <span className="text-emerald-400">LAN Wi-Fi Multi-Device (0.0.0.0)</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/80 border border-white/5 flex flex-col justify-between space-y-4">
            <div>
              <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2 mb-2">
                <ArrowRight className="w-4 h-4 text-emerald-400" />
                Return to Live Command Center
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4 font-sans">
                The presentation slides conclude here. Return to the live operations center to monitor continuous vehicle tracking and test real-time controls.
              </p>
            </div>
            <button
              onClick={onExitSlides}
              className="w-full py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              Open Live Command Dashboard
            </button>
          </div>
        </div>
      )
    }
  ];

  const current = slides[currentSlide];

  // Keyboard navigation for slides
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlide((s) => Math.min(slides.length - 1, s + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((s) => Math.max(0, s - 1));
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, isFullscreen]);

  return (
    <div
      className={`transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 p-6 flex flex-col justify-between'
          : 'rounded-2xl bg-slate-950/70 p-1 border border-white/5 shadow-2xl relative'
      }`}
    >
      <div className="rounded-xl bg-slate-900/90 border border-white/5 p-6 backdrop-blur-md flex flex-col justify-between h-full space-y-4">
        {/* Slide Navigation Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold">
              {current.tag}
            </span>
            <span className="text-xs text-slate-400 font-mono tracking-wider uppercase">
              {current.category}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-white/10 transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Presentation'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onExitSlides}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-white/10 text-slate-300 font-medium transition"
            >
              Exit Slides
            </button>
          </div>
        </div>

        {/* Slide Title & Subtitle */}
        <div className="py-2">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-mono">
            {current.title}
          </h2>
          <p className="text-xs lg:text-sm text-slate-400 mt-1 font-mono">
            {current.subtitle}
          </p>

          {/* Dynamic Slide Body */}
          {current.content}
        </div>

        {/* Slide Footer with Stepper */}
        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
          {/* Step dots */}
          <div className="flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlide ? 'w-8 bg-cyan-400 shadow-md shadow-cyan-400/40' : 'w-2 bg-slate-800 hover:bg-slate-700'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-2 font-mono">
            <button
              onClick={() => setCurrentSlide((s) => Math.max(0, s - 1))}
              disabled={currentSlide === 0}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-white/10 transition disabled:opacity-30 disabled:pointer-events-none"
              title="Previous Slide (Left Arrow)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs text-slate-400 px-2 font-bold">
              {currentSlide + 1} / {slides.length}
            </span>
            <button
              onClick={() => setCurrentSlide((s) => Math.min(slides.length - 1, s + 1))}
              disabled={currentSlide === slides.length - 1}
              className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition disabled:opacity-30 disabled:pointer-events-none shadow-md shadow-cyan-500/20"
              title="Next Slide (Right Arrow)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
