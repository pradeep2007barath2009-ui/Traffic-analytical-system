import React from 'react';
import { Volume2, VolumeX, Eye, Sparkles, Keyboard, HelpCircle, Download, ZoomIn, ZoomOut, Zap } from 'lucide-react';

export default function AccessibilityToolbar({
  colorblindMode,
  setColorblindMode,
  voiceAnnounce,
  setVoiceAnnounce,
  fontSize,
  setFontSize,
  reducedMotion,
  setReducedMotion,
  theme,
  setTheme,
  onOpenShortcuts,
  onOpenGuide,
  onExportCsv
}) {
  return (
    <div className="bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-4 lg:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
      {/* Left: Accessibility Quick Toggles */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          Accessibility:
        </span>

        {/* 1. Colorblind Mode Toggle */}
        <button
          onClick={() => setColorblindMode(!colorblindMode)}
          aria-pressed={colorblindMode}
          title="Toggle High-Contrast Shape & Colorblind Mode (Shortcut: C)"
          className={`px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition ${
            colorblindMode
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/20'
              : 'bg-slate-900/80 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Colorblind: <strong className={colorblindMode ? 'text-amber-300' : 'text-slate-500'}>{colorblindMode ? 'ON' : 'OFF'}</strong></span>
        </button>

        {/* 2. Voice Announcer Toggle */}
        <button
          onClick={() => setVoiceAnnounce(!voiceAnnounce)}
          aria-pressed={voiceAnnounce}
          title="Toggle Screen & Alert Voice Announcer (Shortcut: V)"
          className={`px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition ${
            voiceAnnounce
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/20'
              : 'bg-slate-900/80 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
          }`}
        >
          {voiceAnnounce ? <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          <span>Audio: <strong className={voiceAnnounce ? 'text-emerald-300' : 'text-slate-500'}>{voiceAnnounce ? 'ONLINE' : 'MUTED'}</strong></span>
        </button>

        {/* 3. Text Scaling */}
        <div className="flex items-center gap-1 bg-slate-900/80 border border-white/5 rounded-lg px-2 py-0.5">
          <span className="text-[11px] text-slate-400">Scale:</span>
          <button
            onClick={() => setFontSize('normal')}
            className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition ${fontSize === 'normal' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            1x
          </button>
          <button
            onClick={() => setFontSize('large')}
            className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition ${fontSize === 'large' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            1.2x
          </button>
          <button
            onClick={() => setFontSize('xl')}
            className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition ${fontSize === 'xl' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            1.4x
          </button>
        </div>

        {/* 4. Reduced Motion Toggle */}
        <button
          onClick={() => setReducedMotion(!reducedMotion)}
          aria-pressed={reducedMotion}
          title="Toggle Reduced Motion / Calm Animations"
          className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition ${
            reducedMotion
              ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
              : 'bg-slate-900/80 border-white/5 text-slate-400 hover:text-slate-200'
          }`}
        >
          {reducedMotion ? 'Calm Mode' : 'Motion: On'}
        </button>

        {/* 5. Colorway Style Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-white/5 rounded-lg px-2 py-0.5">
          <span className="text-[11px] text-slate-400">Colorway:</span>
          {[
            { id: 'theme-cyber', label: 'Cyber', dot: 'bg-cyan-400' },
            { id: 'theme-arctic', label: 'Arctic', dot: 'bg-sky-400' },
            { id: 'theme-emerald', label: 'Emerald', dot: 'bg-emerald-400' },
            { id: 'theme-amber', label: 'Amber', dot: 'bg-amber-400' },
            { id: 'theme-monolith', label: 'Monolith', dot: 'bg-zinc-200' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              title={`Switch style to ${t.label}`}
              className={`p-1 rounded-md transition ${theme === t.id ? 'bg-white/10 ring-1 ring-cyan-400/80' : 'hover:bg-white/5'}`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${t.dot}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Right: Shortcuts, Guide, and Export CSV */}
      <div className="flex items-center gap-2">
        {/* Export Infraction CSV */}
        <button
          onClick={onExportCsv}
          className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition active:scale-95 shadow-sm"
          title="Download Violations Report as CSV"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export CSV</span>
        </button>

        {/* Keyboard Shortcuts Dialog */}
        <button
          onClick={onOpenShortcuts}
          className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition active:scale-95 shadow-sm"
          title="View Keyboard Shortcuts (Key: ?)"
        >
          <Keyboard className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Shortcuts</span> [?]
        </button>

        {/* Guided Tour & Documentation */}
        <button
          onClick={onOpenGuide}
          className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition active:scale-95"
          title="System Architecture & User Guide"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-950" />
          <span>Manual</span>
        </button>
      </div>
    </div>
  );
}
