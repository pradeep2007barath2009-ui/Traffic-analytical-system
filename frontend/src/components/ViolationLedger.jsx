import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, FileText, CheckCircle2, Search, Filter, Download, ArrowUpRight, Footprints } from 'lucide-react';

export default function ViolationLedger({ violations = [] }) {
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredViolations = violations.filter((v) => {
    let matchesFilter = true;
    if (filter === 'Pedestrian Yield') {
      matchesFilter = v.type.toLowerCase().includes('pedestrian') || v.type.toLowerCase().includes('yield');
    } else if (filter !== 'ALL') {
      matchesFilter = v.type.toLowerCase().includes(filter.toLowerCase());
    }

    const query = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      (v.id && v.id.toLowerCase().includes(query)) ||
      (v.camera_id && v.camera_id.toLowerCase().includes(query)) ||
      (v.vehicle_type && v.vehicle_type.toLowerCase().includes(query)) ||
      (v.area && v.area.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="rounded-2xl bg-slate-950/70 p-1 border border-white/5 shadow-2xl flex flex-col h-full">
      <div className="rounded-xl bg-slate-900/90 border border-white/5 p-4 backdrop-blur-md flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-wider text-white font-mono uppercase">
                  Automated Enforcement & Citation Ledger
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  {violations.length} LOGGED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Computer vision speed telemetry, red-light intrusion, and pedestrian crosswalk safety
              </p>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by ID, CAM, Area..."
                className="pl-8 pr-3 py-1 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-44 font-mono transition"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-white/5 text-xs font-mono">
              {['ALL', 'Overspeeding', 'Red Light', 'Pedestrian Yield'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                    filter === t
                      ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="mt-3 flex-1 overflow-x-auto overflow-y-auto max-h-[300px]">
          {filteredViolations.length === 0 ? (
            <div className="py-14 flex flex-col items-center justify-center text-slate-500">
              <CheckCircle2 className="w-9 h-9 text-emerald-400/50 mb-2.5" />
              <p className="text-xs font-medium text-slate-300 font-mono">Zero active infractions detected</p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono">Neural enforcement pipeline active across all optical sectors</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-white/5 font-mono text-[11px] uppercase tracking-wider">
                  <th className="pb-2.5 font-medium">Incident ID</th>
                  <th className="pb-2.5 font-medium">Logged Time</th>
                  <th className="pb-2.5 font-medium">Camera / Sector</th>
                  <th className="pb-2.5 font-medium">Target Vehicle</th>
                  <th className="pb-2.5 font-medium">Violation Type</th>
                  <th className="pb-2.5 font-medium">Recorded Speed</th>
                  <th className="pb-2.5 font-medium text-right">Enforcement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredViolations.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 text-cyan-400 font-bold tracking-tight">{item.id}</td>
                    <td className="py-3 text-slate-400">{item.timestamp}</td>
                    <td className="py-3">
                      <span className="text-cyan-300 font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px]">
                        {item.camera_id || 'CAM-01'}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[140px] mt-0.5">{item.area || 'Highway 101'}</span>
                    </td>
                    <td className="py-3 text-slate-200">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-950/80 border border-white/10 text-slate-300 text-[11px]">
                        {item.vehicle_type} #{item.vehicle_id}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border inline-flex items-center gap-1 ${
                          item.type.includes('Pedestrian')
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/15'
                            : item.type.includes('Red Light')
                            ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-sm shadow-rose-500/10'
                            : 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10'
                        }`}
                      >
                        {item.type.includes('Pedestrian') ? (
                          <Footprints className="w-3 h-3 text-amber-300" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-slate-300">{item.speed}</td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        CITATION ISSUED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
