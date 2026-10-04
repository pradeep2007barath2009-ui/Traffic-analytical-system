import React from 'react';
import { Keyboard, X, Zap } from 'lucide-react';

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'A or Space', desc: 'Inject Ambulance & Trigger Green Corridor Preemption', tag: 'Emergency' },
    { key: 'M', desc: 'Toggle Signal Controller (Adaptive AI vs. Fixed 30s)', tag: 'Algorithm' },
    { key: '1', desc: 'Set Traffic Demand to Low Flow (Off-Peak)', tag: 'Simulation' },
    { key: '2', desc: 'Set Traffic Demand to Normal Flow', tag: 'Simulation' },
    { key: '3', desc: 'Set Traffic Demand to Heavy Rush Hour', tag: 'Simulation' },
    { key: 'C', desc: 'Toggle High-Contrast Shape & Colorblind Mode', tag: 'Accessibility' },
    { key: 'V', desc: 'Toggle Voice Audio Announcer (Web Speech TTS)', tag: 'Accessibility' },
    { key: 'E', desc: 'Export Incident & Violation Ledger to CSV', tag: 'Reports' },
    { key: 'L', desc: 'Lock Console and Switch Officer Profile', tag: 'Security' },
    { key: '?', desc: 'Toggle this Keyboard Shortcuts Dialog', tag: 'Help' },
    { key: 'Esc', desc: 'Dismiss active dialog or drawer', tag: 'Navigation' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="rounded-2xl bg-slate-950/80 p-1 border border-white/10 shadow-2xl max-w-lg w-full">
        <div className="rounded-xl bg-slate-900/95 border border-white/5 p-6 backdrop-blur-md relative font-mono">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Keyboard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Keyboard Navigation & Hotkeys</h3>
                <p className="text-[11px] text-slate-400 font-sans">Full console operational commands via keyboard</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-white/5 max-h-[380px] overflow-y-auto pr-1">
            {shortcuts.map((s, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-300 font-sans">{s.desc}</span>
                <kbd className="px-2.5 py-1 rounded-lg bg-slate-950 border border-white/10 font-bold text-cyan-400 text-[11px] shadow-inner whitespace-nowrap">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-3 border-t border-white/5 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              Close Shortcuts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
