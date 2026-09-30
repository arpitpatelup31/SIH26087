import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOfflineSync } from '../context/OfflineSyncContext';
import { 
  BookOpen, 
  Award, 
  BrainCircuit, 
  Sparkles, 
  User, 
  LogOut, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  ShieldCheck, 
  LayoutDashboard,
  GraduationCap,
  Layers,
  ChevronDown
} from 'lucide-react';

export const Navbar = ({ currentTab, onNavigate }) => {
  const { user, logout, switchDemoUser, isTrainer, isAdmin } = useAuth();
  const { isOnline, syncQueueCount, isSyncing, triggerSync, setIsSyncModalOpen, toggleOfflineSimulation } = useOfflineSync();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [demoSwitchOpen, setDemoSwitchOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'skills', label: 'AI Skill Analysis', icon: BrainCircuit, badge: 'AI' },
    { id: 'recommendations', label: 'Recommendations', icon: Sparkles },
    { id: 'certificates', label: 'Certificates', icon: Award },
  ];

  if (isTrainer) {
    navItems.push({ id: 'trainer', label: 'Trainer Studio', icon: GraduationCap });
  }

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin Portal', icon: ShieldCheck });
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      {/* Top Ministry & Cooperative Bar */}
      <div className="bg-emerald-800 text-emerald-100 text-xs px-4 py-1 flex items-center justify-between border-b border-emerald-700">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-white tracking-wide flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            CoopConnect LMS
          </span>
          <span className="text-emerald-300">|</span>
          <span className="hidden sm:inline text-emerald-200">National Cooperative Skill Development Initiative (SIH26087)</span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Quick Demo Switcher */}
          <div className="relative">
            <button
              onClick={() => setDemoSwitchOpen(!demoSwitchOpen)}
              className="flex items-center space-x-1.5 bg-emerald-700/80 hover:bg-emerald-600 px-2 py-0.5 rounded text-white text-[11px] font-medium transition cursor-pointer"
            >
              <span>Demo Role:</span>
              <span className="capitalize underline font-bold">{user?.role_name || 'Guest'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {demoSwitchOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-1 text-slate-800 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                  Switch Demo Persona (1-Click)
                </div>
                <button
                  onClick={() => { switchDemoUser('student'); setDemoSwitchOpen(false); onNavigate('dashboard'); }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold">Ramesh Patel</div>
                    <div className="text-[10px] text-slate-500">Student / Cooperative Member</div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Student</span>
                </button>
                <button
                  onClick={() => { switchDemoUser('trainer'); setDemoSwitchOpen(false); onNavigate('trainer'); }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold">Dr. Anand Deshmukh</div>
                    <div className="text-[10px] text-slate-500">NCCT Trainer / Faculty</div>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">Trainer</span>
                </button>
                <button
                  onClick={() => { switchDemoUser('admin'); setDemoSwitchOpen(false); onNavigate('admin'); }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold">Vikramaditya Rao</div>
                    <div className="text-[10px] text-slate-500">NCDC / Ministry Admin</div>
                  </div>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold">Admin</span>
                </button>
              </div>
            )}
          </div>

          {/* Edge / Offline Status Badge */}
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
              isOnline ? 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-900' : 'bg-amber-500 text-white animate-pulse'
            }`}
          >
            {isOnline ? <Wifi className="w-3 h-3 text-emerald-300" /> : <WifiOff className="w-3 h-3 text-white" />}
            <span>{isOnline ? 'Cloud Synced' : `Offline Mode (${syncQueueCount})`}</span>
            {syncQueueCount > 0 && (
              <span className="ml-1 bg-amber-400 text-amber-950 font-bold px-1 rounded-full text-[9px]">
                {syncQueueCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">Coop</span>
                <span className="text-xl font-extrabold tracking-tight text-emerald-600">Connect</span>
                <span className="text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded ml-1">LMS</span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">AI-Powered Learning & Skill Development</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition cursor-pointer relative ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 text-[10px] font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile / Logout */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2.5 p-1.5 rounded-full hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-emerald-500 bg-white"
                  />
                  <div className="hidden lg:block text-left pr-2">
                    <div className="text-xs font-bold text-slate-800 leading-tight">{user.name}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{user.cooperative_society || user.role_name}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-800">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                          {user.role_name}
                        </span>
                        {user.member_id && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            ID: {user.member_id}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => { onNavigate('dashboard'); setProfileDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>Learner Dashboard</span>
                      </button>
                      <button
                        onClick={() => { onNavigate('certificates'); setProfileDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                      >
                        <Award className="w-4 h-4 text-slate-400" />
                        <span>My Certificates</span>
                      </button>
                      <button
                        onClick={() => { setIsSyncModalOpen(true); setProfileDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                      >
                        <RefreshCw className="w-4 h-4 text-slate-400" />
                        <span>Offline & Sync Settings</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => { logout(); setProfileDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-xs"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Row */}
      <div className="md:hidden border-t border-slate-200 bg-slate-50 px-2 py-1.5 flex items-center justify-around overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-600'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

export default Navbar;
