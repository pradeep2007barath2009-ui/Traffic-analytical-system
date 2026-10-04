import React, { useState } from 'react';
import Auth3dScene from './Auth3dScene';
import {
  ShieldCheck,
  Radio,
  Lock,
  User,
  KeyRound,
  Building2,
  MapPin,
  BadgeAlert,
  ArrowRight,
  UserCheck,
  CheckCircle,
  Eye,
  EyeOff,
  Compass
} from 'lucide-react';

const DEMO_OFFICERS = [
  {
    name: 'Commander Vance',
    badge: 'CTRL-01',
    role: 'System Administrator',
    department: 'Traffic Operations Bureau',
    sector: 'All Sectors'
  },
  {
    name: 'Officer Sarah Chen',
    badge: 'SURV-88',
    role: 'Surveillance Lead',
    department: 'Municipal Highway Patrol',
    sector: 'North Expressway'
  },
  {
    name: 'Paramedic Unit 4',
    badge: 'EMERG-12',
    role: 'Emergency Dispatcher',
    department: 'Emergency Medical Dispatch',
    sector: 'Hospital Green Route'
  }
];

const DEPARTMENTS = [
  'Traffic Operations Bureau',
  'Department of Transportation',
  'Emergency Medical Dispatch',
  'Municipal Highway Patrol',
  'Automated Enforcement Division'
];

const SECTORS = [
  'All Sectors',
  'North Expressway',
  'Downtown Commercial',
  'Tech Park Corridor',
  'Hospital Green Route'
];

const ROLES = [
  'Operations Specialist',
  'Surveillance Officer',
  'Emergency Dispatcher',
  'System Administrator'
];

export default function AuthPortal({ onLoginSuccess, onCancel }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login Form State
  const [loginBadge, setLoginBadge] = useState('CTRL-01');
  const [loginPassword, setLoginPassword] = useState('••••••••');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regBadge, setRegBadge] = useState('');
  const [regDepartment, setRegDepartment] = useState(DEPARTMENTS[0]);
  const [regSector, setRegSector] = useState(SECTORS[0]);
  const [regRole, setRegRole] = useState(ROLES[0]);
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const handleQuickLogin = (officer) => {
    setErrorMsg('');
    setSuccessMsg(`Authorizing credentials for ${officer.name}...`);
    setTimeout(() => {
      const userData = {
        name: officer.name,
        badge: officer.badge,
        role: officer.role,
        department: officer.department,
        sector: officer.sector,
        token: `JWT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem('urbanflow_user', JSON.stringify(userData));
      onLoginSuccess(userData);
    }, 400);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginBadge.trim()) {
      setErrorMsg('Badge ID or call sign is required.');
      return;
    }
    if (!loginPassword.trim()) {
      setErrorMsg('Access key password is required.');
      return;
    }

    setSuccessMsg('Verifying security clearance credentials...');
    setTimeout(() => {
      const matched = DEMO_OFFICERS.find(
        (o) => o.badge.toLowerCase() === loginBadge.trim().toLowerCase()
      );

      const userData = {
        name: matched ? matched.name : `Officer ${loginBadge.trim().toUpperCase()}`,
        badge: matched ? matched.badge : loginBadge.trim().toUpperCase(),
        role: matched ? matched.role : 'Traffic Controller',
        department: matched ? matched.department : 'Department of Transportation',
        sector: matched ? matched.sector : 'Downtown Commercial',
        token: `JWT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        loginTime: new Date().toISOString()
      };

      localStorage.setItem('urbanflow_user', JSON.stringify(userData));
      onLoginSuccess(userData);
    }, 450);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regName.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }
    if (!regBadge.trim()) {
      setErrorMsg('Call sign or badge number is required.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Password must contain at least 6 characters.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setSuccessMsg('Registering new officer profile...');
    setTimeout(() => {
      const userData = {
        name: regName.trim(),
        badge: regBadge.trim().toUpperCase(),
        role: regRole,
        department: regDepartment,
        sector: regSector,
        token: `JWT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        loginTime: new Date().toISOString()
      };

      localStorage.setItem('urbanflow_user', JSON.stringify(userData));
      onLoginSuccess(userData);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 overflow-hidden">
      {/* 3D Background Canvas */}
      <Auth3dScene />

      {/* Floating HUD Cyber Overlay Elements */}
      <div className="absolute top-4 left-6 z-20 pointer-events-none flex items-center gap-3 font-mono">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/10 backdrop-blur-md">
          <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
        </div>
        <div>
          <div className="text-xs font-bold text-white tracking-wider uppercase">
            UrbanFlow AI Gateway
          </div>
          <div className="text-[10px] text-cyan-400">
            SECURE ACCESS SYSTEM // NODE 04
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-6 z-20 pointer-events-none hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-[11px] font-mono text-slate-300 backdrop-blur-md">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>3D DIGITAL TWIN ACTIVE</span>
      </div>

      {/* Main Authentication Terminal Window */}
      <div className="relative z-30 w-full max-w-md mx-4 rounded-3xl bg-slate-950/80 p-1 border border-white/10 shadow-2xl">
        <div className="rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/5 p-6 sm:p-7 overflow-y-auto max-h-[92vh]">
          {/* Terminal Header */}
          <div className="text-center space-y-1 mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-400 tracking-wider uppercase mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Security Clearance Level 4
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
              {mode === 'login' ? 'Operations Sign In' : 'Officer Commission'}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              {mode === 'login'
                ? 'Enter credentials to authorize telemetry and signal command access'
                : 'Register personnel credentials for the municipal mobility grid'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/80 rounded-xl border border-white/5 text-xs mb-5 font-mono">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 rounded-lg transition font-bold ${
                mode === 'login'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 rounded-lg transition font-bold ${
                mode === 'register'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register Officer
            </button>
          </div>

          {/* Status Alerts */}
          {errorMsg && (
            <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 font-mono">
              <BadgeAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-mono">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Demo Credentials Strip (shown on login mode) */}
          {mode === 'login' && (
            <div className="mb-5 space-y-2">
              <div className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">
                Quick Demo Personnel:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 font-mono">
                {DEMO_OFFICERS.map((officer) => (
                  <button
                    key={officer.badge}
                    type="button"
                    onClick={() => handleQuickLogin(officer)}
                    className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-white/5 hover:border-cyan-500/50 text-left transition text-xs group cursor-pointer"
                  >
                    <div className="font-bold text-slate-200 group-hover:text-cyan-300 truncate">
                      {officer.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-cyan-400">{officer.badge}</div>
                    <div className="text-[9px] text-slate-500 truncate">{officer.role.split(' ')[0]}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* --- LOGIN FORM --- */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  Badge ID or Call Sign
                </label>
                <input
                  type="text"
                  value={loginBadge}
                  onChange={(e) => setLoginBadge(e.target.value)}
                  placeholder="e.g. CTRL-01 or user@city.gov"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 focus:border-cyan-400 text-slate-100 placeholder-slate-600 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    Access Security Key
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-slate-400 hover:text-cyan-300 cursor-pointer"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter security key"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 focus:border-cyan-400 text-slate-100 placeholder-slate-600 outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer uppercase tracking-wider"
              >
                <span>Authorize & Enter Console</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </form>
          )}

          {/* --- REGISTER FORM (SIGN UP) --- */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Full Name</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Officer J. Vance"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 focus:border-cyan-400 text-slate-100 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Call Sign / Badge</label>
                  <input
                    type="text"
                    value={regBadge}
                    onChange={(e) => setRegBadge(e.target.value)}
                    placeholder="CTRL-77"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 focus:border-cyan-400 text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  Department / Bureau
                </label>
                <select
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 focus:border-cyan-400 text-slate-100 outline-none"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    Assigned Sector
                  </label>
                  <select
                    value={regSector}
                    onChange={(e) => setRegSector(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-white/10 focus:border-cyan-400 text-slate-100 outline-none text-[11px]"
                  >
                    {SECTORS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-cyan-400" />
                    Operator Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-white/10 focus:border-cyan-400 text-slate-100 outline-none text-[11px]"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Access Key</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 focus:border-cyan-400 text-slate-100 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Confirm Key</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat key"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 focus:border-cyan-400 text-slate-100 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer uppercase tracking-wider"
              >
                <span>Commission Officer Profile</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </form>
          )}

          {/* Guest or Cancel Footer */}
          <div className="mt-4 pt-3 border-t border-white/5 text-center flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <button
              type="button"
              onClick={() => handleQuickLogin(DEMO_OFFICERS[0])}
              className="hover:text-cyan-400 transition underline underline-offset-2 cursor-pointer"
            >
              Bypass As Guest Controller
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="hover:text-white transition cursor-pointer"
              >
                Close Window
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
