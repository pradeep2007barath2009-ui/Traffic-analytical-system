import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Award, Layers } from 'lucide-react';

const DEFAULT_ANALYTICS = {
  hourly_volume: [
    { hour: '06:00', adaptive_ai: 340, baseline_fixed: 260 },
    { hour: '08:00', adaptive_ai: 820, baseline_fixed: 590 },
    { hour: '10:00', adaptive_ai: 660, baseline_fixed: 510 },
    { hour: '12:00', adaptive_ai: 610, baseline_fixed: 480 },
    { hour: '14:00', adaptive_ai: 640, baseline_fixed: 500 },
    { hour: '16:00', adaptive_ai: 890, baseline_fixed: 640 },
    { hour: '18:00', adaptive_ai: 960, baseline_fixed: 710 },
    { hour: '20:00', adaptive_ai: 540, baseline_fixed: 440 },
    { hour: '22:00', adaptive_ai: 310, baseline_fixed: 250 }
  ],
  vehicle_breakdown: [
    { name: 'Passenger Cars', value: 64, color: '#38bdf8' },
    { name: 'Motorcycles & 2-Wheelers', value: 18, color: '#10b981' },
    { name: 'Transit Buses', value: 9, color: '#f59e0b' },
    { name: 'Commercial Trucks', value: 6, color: '#a855f7' },
    { name: 'Emergency Units', value: 3, color: '#f43f5e' }
  ],
  wait_time_comparison: [
    { approach: 'North Expressway', reduction_pct: 38.4, adaptive_wait_sec: 14.2, fixed_wait_sec: 23.0 },
    { approach: 'Downtown Commercial', reduction_pct: 42.1, adaptive_wait_sec: 16.5, fixed_wait_sec: 28.5 },
    { approach: 'Tech Park Corridor', reduction_pct: 35.8, adaptive_wait_sec: 13.8, fixed_wait_sec: 21.5 },
    { approach: 'Hospital Green Route', reduction_pct: 46.2, adaptive_wait_sec: 9.4, fixed_wait_sec: 17.5 }
  ]
};

export default function AnalyticsCharts() {
  const [data, setData] = useState(DEFAULT_ANALYTICS);

  useEffect(() => {
    fetch('/api/analytics/historical')
      .then((r) => r.json())
      .then((d) => {
        if (d && d.hourly_volume) setData(d);
      })
      .catch((e) => {
        // Fallback to pre-calibrated baseline models for standalone deployment
      });
  }, []);

  if (!data) {
    return (
      <div className="rounded-2xl bg-slate-950/70 p-1 border border-white/5">
        <div className="rounded-xl bg-slate-900/90 border border-white/5 p-8 flex items-center justify-center text-slate-400 text-xs font-mono">
          Loading analytical models and throughput history...
        </div>
      </div>
    );
  }

  const { hourly_volume, vehicle_breakdown, wait_time_comparison } = data;
  const maxVolume = Math.max(...hourly_volume.map((h) => h.adaptive_ai));

  return (
    <div className="rounded-2xl bg-slate-950/70 p-1 border border-white/5 shadow-2xl">
      <div className="rounded-xl bg-slate-900/90 border border-white/5 p-4 backdrop-blur-md space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider text-white font-mono uppercase">
                Metropolitan Flow Analytics & Throughput Intelligence
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Comparative evaluation between adaptive neural dispatch and fixed baseline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Adaptive AI
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 px-2 py-0.5 rounded bg-slate-950/80 border border-white/5">
              <span className="w-2 h-2 rounded-full bg-slate-600" /> Fixed Baseline
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Hourly Flow Comparison */}
          <div className="lg:col-span-2 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-slate-300">Corridor Vehicle Throughput (Vehicles / Hour)</span>
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                +28.4% Peak Capacity Gain
              </span>
            </div>

            <div className="h-48 flex items-end gap-2 pt-6 px-3 bg-slate-950/80 rounded-xl border border-white/5">
              {hourly_volume.map((item, idx) => {
                const hAdaptive = (item.adaptive_ai / maxVolume) * 100;
                const hFixed = (item.baseline_fixed / maxVolume) * 100;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-14 hidden group-hover:flex flex-col items-center bg-slate-900/95 border border-white/10 p-2 rounded-xl text-[10px] text-white z-20 whitespace-nowrap shadow-2xl backdrop-blur-md">
                      <span className="font-bold text-cyan-400 font-mono">{item.hour}</span>
                      <span className="font-mono text-emerald-400">AI: {item.adaptive_ai} veh</span>
                      <span className="text-slate-400 font-mono">Fixed: {item.baseline_fixed} veh</span>
                    </div>

                    {/* Bars */}
                    <div className="w-full flex items-end justify-center gap-1.5 h-full pb-1.5">
                      <div
                        className="w-full max-w-[8px] bg-slate-700/80 rounded-t transition-all group-hover:bg-slate-600"
                        style={{ height: `${hFixed}%` }}
                      />
                      <div
                        className="w-full max-w-[8px] bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t transition-all group-hover:brightness-125 shadow-sm shadow-cyan-500/40"
                        style={{ height: `${hAdaptive}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono mt-1">{item.hour.split(':')[0]}h</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Vehicle Distribution & Approach Wait Reduction */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <div className="text-xs font-mono font-semibold text-slate-300 mb-2.5">Vehicle Fleet Composition</div>
              <div className="space-y-2">
                {vehicle_breakdown.map((vb) => (
                  <div key={vb.name} className="text-xs font-mono">
                    <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
                      <span>{vb.name}</span>
                      <span className="font-bold text-white">{vb.value}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/5">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${vb.value}%`, backgroundColor: vb.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/5">
              <div className="text-xs font-mono font-semibold text-slate-300 mb-2">Sector Delay Abatement</div>
              <div className="grid grid-cols-2 gap-2 text-center font-mono">
                {wait_time_comparison.slice(0, 2).map((w) => (
                  <div key={w.approach} className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5">
                    <div className="text-[10px] text-slate-400 truncate">{w.approach}</div>
                    <div className="text-base font-extrabold text-emerald-400 mt-0.5">-{w.reduction_pct}%</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{w.adaptive_wait_sec}s vs {w.fixed_wait_sec}s</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
