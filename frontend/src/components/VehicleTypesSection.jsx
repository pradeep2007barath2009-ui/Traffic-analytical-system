import React, { useState } from 'react';
import { Car, Bike, Bus, Truck, Siren, ShieldCheck, ArrowUpRight, Gauge, Users, Activity } from 'lucide-react';

export default function VehicleTypesSection({ metrics, onInjectAmbulance }) {
  const byType = metrics?.by_type || {
    car: { count: 8, avg_speed: 42.1 },
    motorcycle: { count: 4, avg_speed: 48.5 },
    bus: { count: 2, avg_speed: 34.0 },
    truck: { count: 1, avg_speed: 31.5 },
    ambulance: { count: 0, avg_speed: 0 }
  };

  const [selectedType, setSelectedType] = useState('all');

  const vehicleCategories = [
    {
      id: 'car',
      name: 'Passenger Cars (LMV)',
      icon: <Car className="w-4 h-4 text-cyan-400" />,
      color: 'hover:border-cyan-500/40',
      badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      count: byType.car?.count || 0,
      speed: byType.car?.avg_speed || 0,
      share: '64%',
      desc: 'Standard private vehicles and rideshares. Governed by 60 km/h municipal corridor limit.',
      priority: 'Standard',
      flowFactor: 'High Volume'
    },
    {
      id: 'motorcycle',
      name: 'Motorcycles & 2-Wheelers',
      icon: <Bike className="w-4 h-4 text-emerald-400" />,
      color: 'hover:border-emerald-500/40',
      badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      count: byType.motorcycle?.count || 0,
      speed: byType.motorcycle?.avg_speed || 0,
      share: '18%',
      desc: 'High acceleration dynamics. Monitored for lane filtering compliance and helmet telemetry.',
      priority: 'Standard',
      flowFactor: 'Agile Flow'
    },
    {
      id: 'bus',
      name: 'Transit Buses & Shuttles',
      icon: <Bus className="w-4 h-4 text-amber-400" />,
      color: 'hover:border-amber-500/40',
      badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      count: byType.bus?.count || 0,
      speed: byType.bus?.avg_speed || 0,
      share: '9%',
      desc: 'High-capacity urban transit. Estimated commuter capacity of 42 passengers per vehicle unit.',
      priority: 'Transit Priority',
      flowFactor: 'High Capacity'
    },
    {
      id: 'truck',
      name: 'Commercial Freight Trucks',
      icon: <Truck className="w-4 h-4 text-purple-400" />,
      color: 'hover:border-purple-500/40',
      badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      count: byType.truck?.count || 0,
      speed: byType.truck?.avg_speed || 0,
      share: '6%',
      desc: 'Multi-axle logistics freight. Restricted to primary arterial lanes with extended braking windows.',
      priority: 'Regulated Heavy',
      flowFactor: 'High Inertia'
    },
    {
      id: 'ambulance',
      name: 'Emergency Response Units',
      icon: <Siren className="w-4 h-4 text-rose-400 animate-bounce" />,
      color: 'hover:border-rose-500/50',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold',
      count: byType.ambulance?.count || 0,
      speed: byType.ambulance?.avg_speed || 0,
      share: '3%',
      desc: 'Paramedic & emergency response vehicles. Triggers immediate Green Corridor preemption signal override.',
      priority: 'Rapid Preemption',
      flowFactor: 'Route Priority'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider text-white font-mono uppercase">
              Vehicle Classification & Fleet Dynamics Matrix
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Real-time multi-target classification categorized by kinetics, speed profile, and clearance priority
            </p>
          </div>
        </div>

        {/* Filter / Filter tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-white/5 p-1 rounded-xl text-xs font-mono">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              selectedType === 'all'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Classes
          </button>
          {vehicleCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedType(c.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                selectedType === c.id ? `${c.badgeBg} border` : 'text-slate-400 hover:text-white'
              }`}
            >
              {c.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Vehicle Class Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {vehicleCategories
          .filter((cat) => selectedType === 'all' || selectedType === cat.id)
          .map((cat) => (
            <div
              key={cat.id}
              className={`rounded-2xl bg-slate-950/70 p-1 border border-white/5 transition-all duration-300 shadow-xl ${cat.color}`}
            >
              <div className="rounded-xl bg-slate-900/90 border border-white/5 p-4 backdrop-blur-md flex flex-col justify-between h-full space-y-4">
                <div>
                  {/* Card Top */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-white/10 flex items-center justify-center">
                      {cat.icon}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-mono font-bold ${cat.badgeBg}`}>
                      {cat.priority}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="text-xs font-bold text-white font-mono">{cat.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-3 font-mono">
                    {cat.desc}
                  </p>
                </div>

                {/* Metrics */}
                <div className="pt-3 border-t border-white/5 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Active Units:</span>
                    <span className="text-base font-extrabold text-white">{cat.count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Velocity:</span>
                    <span className="font-semibold text-slate-200">
                      {cat.speed > 0 ? `${cat.speed} km/h` : 'Standstill'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Corridor Share:</span>
                    <span className="text-cyan-400 font-bold">{cat.share}</span>
                  </div>

                  {cat.id === 'ambulance' && (
                    <button
                      onClick={onInjectAmbulance}
                      className="w-full mt-2 py-2 px-3 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-md shadow-rose-600/30 transition active:scale-95 cursor-pointer"
                    >
                      🚨 Dispatch Unit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
