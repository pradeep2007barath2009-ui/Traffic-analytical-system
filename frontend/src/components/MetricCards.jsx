import React from 'react';
import { Car, Gauge, Activity, TrendingDown, Leaf, ShieldCheck } from 'lucide-react';

export default function MetricCards({ metrics, greenCorridor }) {
  const {
    active_vehicles = 0,
    total_cleared = 0,
    avg_speed_kmh = 0,
    avg_wait_sec = 0,
    congestion_index = 0,
    wait_reduction_pct = 0,
    co2_saved_kg = 0
  } = metrics || {};

  const getCongestionBadge = (val) => {
    if (val < 35) return { text: 'OPTIMAL', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (val < 70) return { text: 'MODERATE', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { text: 'HEAVY QUEUES', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const congBadge = getCongestionBadge(congestion_index);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Active Targets */}
      <div className="group rounded-2xl bg-slate-950/60 p-1 border border-white/5 hover:border-cyan-500/30 transition shadow-lg shadow-black/20">
        <div className="h-full rounded-xl bg-slate-900/90 backdrop-blur-md p-3.5 flex flex-col justify-between space-y-2 border border-white/5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Active Targets</span>
            <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Car className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              {active_vehicles}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center justify-between">
              <span>Cleared:</span>
              <strong className="text-slate-200">{total_cleared} veh</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Corridor Speed */}
      <div className="group rounded-2xl bg-slate-950/60 p-1 border border-white/5 hover:border-blue-500/30 transition shadow-lg shadow-black/20">
        <div className="h-full rounded-xl bg-slate-900/90 backdrop-blur-md p-3.5 flex flex-col justify-between space-y-2 border border-white/5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Corridor Velocity</span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Gauge className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white font-mono tabular-nums tracking-tight flex items-baseline gap-1">
              {avg_speed_kmh} <span className="text-xs text-slate-400 font-normal">km/h</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center justify-between">
              <span>Limit:</span>
              <strong className="text-slate-200">60 km/h</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Congestion Index */}
      <div className="group rounded-2xl bg-slate-950/60 p-1 border border-white/5 hover:border-purple-500/30 transition shadow-lg shadow-black/20">
        <div className="h-full rounded-xl bg-slate-900/90 backdrop-blur-md p-3.5 flex flex-col justify-between space-y-2 border border-white/5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Congestion Index</span>
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-extrabold text-white font-mono tabular-nums tracking-tight">
                {congestion_index}%
              </div>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${congBadge.color}`}>
                {congBadge.text}
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  congestion_index > 70 ? 'bg-rose-500' : congestion_index > 40 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, congestion_index)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. AI Wait Reduction */}
      <div className="group rounded-2xl bg-slate-950/60 p-1 border border-white/5 hover:border-emerald-500/30 transition shadow-lg shadow-black/20">
        <div className="h-full rounded-xl bg-slate-900/90 backdrop-blur-md p-3.5 flex flex-col justify-between space-y-2 border border-white/5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Wait Reduction</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono tabular-nums tracking-tight">
              -{wait_reduction_pct}%
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center justify-between">
              <span>Avg Delay:</span>
              <strong className="text-slate-200">{avg_wait_sec}s/veh</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Carbon Emissions Saved */}
      <div className="group rounded-2xl bg-slate-950/60 p-1 border border-white/5 hover:border-teal-500/30 transition shadow-lg shadow-black/20">
        <div className="h-full rounded-xl bg-slate-900/90 backdrop-blur-md p-3.5 flex flex-col justify-between space-y-2 border border-white/5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">CO2 Prevented</span>
            <div className="w-6 h-6 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Leaf className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white font-mono tabular-nums tracking-tight flex items-baseline gap-1">
              {co2_saved_kg} <span className="text-xs text-slate-400 font-normal">kg</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center justify-between">
              <span>Status:</span>
              <strong className="text-teal-400 font-semibold">Idle Reduction</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Emergency Preemptions */}
      <div className="group rounded-2xl bg-slate-950/60 p-1 border border-white/5 hover:border-amber-500/30 transition shadow-lg shadow-black/20">
        <div className="h-full rounded-xl bg-slate-900/90 backdrop-blur-md p-3.5 flex flex-col justify-between space-y-2 border border-white/5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Priority Routes</span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              {greenCorridor?.cleared_count || 0}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center justify-between">
              <span>Time Saved:</span>
              <strong className="text-amber-400">{greenCorridor?.time_saved_sec || 0}s</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
