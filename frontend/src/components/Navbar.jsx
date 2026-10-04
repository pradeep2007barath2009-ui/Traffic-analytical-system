import React, { useState, useEffect } from 'react';
import { Radio, Clock, Cpu, Siren, User, Lock, Activity, Shield } from 'lucide-react';

export default function Navbar({ isConnected, greenCorridor, mode, currentUser, onOpenAuth, onLogout }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 px-4 lg:px-6 py-2.5 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Mission Status */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white font-mono">
                URBANFLOW <span className="text-cyan-400 font-extrabold">AI</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 tracking-wider">
                OPS v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans tracking-normal hidden sm:block">
              Metropolitan Traffic Analytics & Adaptive Control Center
            </p>
          </div>
        </div>

        {/* Emergency Green Corridor Priority Alert */}
        {greenCorridor?.active && (
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 animate-emergency shadow-lg">
            <Siren className="w-4 h-4 text-red-400 animate-spin" style={{ animationDuration: '3s' }} />
            <div className="text-xs font-mono font-bold tracking-wide uppercase">
              <span className="text-white">CORRIDOR OVERRIDE ACTIVE</span> : {greenCorridor.direction} ROUTE PREEMPTED
            </div>
          </div>
        )}

        {/* System Telemetry & Operator Controls */}
        <div className="flex items-center gap-2 text-xs">
          {/* Signal Mode Controller */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 text-[11px]">Mode:</span>
            <span className={`font-mono text-xs font-bold ${mode === 'ADAPTIVE' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {mode}
            </span>
          </div>

          {/* Telemetry Ingestion Ping */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </span>
            <span className="font-mono text-[11px] text-slate-300">
              {isConnected ? 'LIVE 5HZ' : 'CONNECTING'}
            </span>
          </div>

          {/* Master Clock */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 font-mono text-[11px] tabular-nums">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{time}</span>
          </div>

          {/* Officer Profile & Auth Controls */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <button
                type="button"
                onClick={onOpenAuth}
                title="Click to view officer credentials or switch profile"
                className="group flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 transition text-left"
              >
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-[10px] font-mono shadow-sm">
                  {currentUser.badge ? currentUser.badge.substring(0, 4) : 'OP'}
                </div>
                <div className="hidden lg:block">
                  <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition flex items-center gap-1.5">
                    <span>{currentUser.name}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50 font-mono">
                      {currentUser.role ? currentUser.role.split(' ')[0] : 'OPERATOR'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {currentUser.department || 'Traffic Ops'}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={onLogout}
                title="Lock Console and Sign Out"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
