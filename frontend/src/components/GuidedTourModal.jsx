import React, { useState } from 'react';
import { HelpCircle, X, ChevronRight, ChevronLeft, Check, Video, Compass, Sliders, ShieldAlert, BarChart3 } from 'lucide-react';

export default function GuidedTourModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'UrbanFlow AI Operations Center Architecture',
      icon: <HelpCircle className="w-5 h-5 text-cyan-400" />,
      content:
        'UrbanFlow AI is an intelligent smart city platform that bridges real-time Computer Vision surveillance, dynamic Webster queue-based signal optimization, and emergency green corridors for first responders.',
      badge: 'Architecture Overview'
    },
    {
      title: '1. Real-time Computer Vision Video Feed',
      icon: <Video className="w-5 h-5 text-cyan-400" />,
      content:
        'The CCTV stream processes live vehicle frames using YOLOv8 and ByteTrack. It classifies vehicles, calculates displacement-based speed in km/h, tracks trajectory trails, and flags infractions (overspeeding >60 km/h or crossing stop-lines during red signals).',
      badge: 'AI Vision Pipeline'
    },
    {
      title: '2. Adaptive Signal Optimization vs. Fixed Timing',
      icon: <Sliders className="w-5 h-5 text-emerald-400" />,
      content:
        'Standard intersections use static 30s timers regardless of empty roads. Our Adaptive AI Controller continuously tallies queue pressure on North-South vs East-West corridors and dynamically adjusts green phases (10s to 50s) to minimize vehicle delay by up to 40%.',
      badge: 'Traffic Controller'
    },
    {
      title: '3. Emergency Green Corridor Preemption',
      icon: <Compass className="w-5 h-5 text-rose-400" />,
      content:
        'When an ambulance or fire truck approaches, the system detects its signature and engages emergency preemption. Conflicting phases safely clear to red, and the emergency path locks green until the vehicle exits, saving crucial golden-hour response minutes.',
      badge: 'Life-Safety System'
    },
    {
      title: '4. Environmental Impact & Infraction Ledger',
      icon: <ShieldAlert className="w-5 h-5 text-amber-400" />,
      content:
        'Every second saved at an idle light prevents fuel waste and greenhouse gas emissions (tracked live in kg CO2). Violations are automatically indexed into an auditable E-Challan ledger that can be exported with 1-click.',
      badge: 'Auditing & Green Tech'
    }
  ];

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="rounded-2xl bg-slate-950/80 p-1 border border-white/10 shadow-2xl max-w-xl w-full">
        <div className="rounded-xl bg-slate-900/95 border border-white/5 p-6 backdrop-blur-md relative font-mono">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                {current.icon}
              </div>
              <div>
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                  {current.badge} (Step {step + 1} of {steps.length})
                </span>
                <h3 className="text-sm font-bold text-white uppercase">{current.title}</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="py-6">
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{current.content}</p>
          </div>

          {/* Step Indicators & Footer */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === step ? 'w-6 bg-cyan-400 shadow-md shadow-cyan-400/40' : 'w-2 bg-slate-800 hover:bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1 transition border border-white/5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}

              {step < steps.length - 1 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-md shadow-cyan-500/20 transition cursor-pointer"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-500/20 transition cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Enter Console
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
