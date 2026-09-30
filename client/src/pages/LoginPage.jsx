import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Layers, ShieldCheck, UserCheck, GraduationCap, Building2, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const LoginPage = ({ onNavigate }) => {
  const { login, register, switchDemoUser } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    cooperativeSociety: 'Kaira District Co-operative Milk Producers Union',
    memberId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        await register(formData);
      } else {
        await login(formData.email, formData.password);
      }
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (roleName) => {
    setLoading(true);
    try {
      await switchDemoUser(roleName);
      if (roleName === 'trainer') {
        onNavigate('trainer');
      } else if (roleName === 'admin') {
        onNavigate('admin');
      } else {
        onNavigate('dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Brand & Quick Demo Personas */}
        <div className="md:col-span-6 bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center space-x-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white">
                <Layers className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white">Coop</span>
                <span className="text-2xl font-black tracking-tight text-emerald-400">Connect</span>
                <span className="text-xs font-bold uppercase tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded ml-2">
                  LMS
                </span>
              </div>
            </div>

            <h2 className="text-xl font-extrabold text-white leading-tight mb-3">
              AI-Powered Learning & Skill Development for Indian Cooperatives
            </h2>
            <p className="text-xs text-emerald-200/90 leading-relaxed mb-6">
              Empowering PACS Secretaries, Dairy Union Staff, and Cooperative Members with personalized AI skill gap analysis, modular training, and verifiable digital certifications.
            </p>

            {/* Quick Demo Switcher Cards for SIH Judges */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                ⚡ 1-Click Persona Login (For SIH Evaluators):
              </div>

              <div 
                onClick={() => handleDemoLogin('student')}
                className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl cursor-pointer transition flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300">Ramesh Patel (Learner)</div>
                    <div className="text-[10px] text-emerald-200">Kaira Milk Producers Union (Dairy / PACS)</div>
                  </div>
                </div>
                <span className="text-xs bg-emerald-500/40 text-emerald-100 px-2 py-0.5 rounded font-semibold text-[10px]">
                  Student
                </span>
              </div>

              <div 
                onClick={() => handleDemoLogin('trainer')}
                className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl cursor-pointer transition flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold text-xs">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-300">Dr. Anand Deshmukh (Trainer)</div>
                    <div className="text-[10px] text-emerald-200">VAMNICOM / National Council for Coop Training</div>
                  </div>
                </div>
                <span className="text-xs bg-amber-500/40 text-amber-100 px-2 py-0.5 rounded font-semibold text-[10px]">
                  Trainer
                </span>
              </div>

              <div 
                onClick={() => handleDemoLogin('admin')}
                className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl cursor-pointer transition flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center text-white font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-purple-300">Vikramaditya Rao (Admin)</div>
                    <div className="text-[10px] text-emerald-200">National Cooperative Dev Corp (NCDC)</div>
                  </div>
                </div>
                <span className="text-xs bg-purple-500/40 text-purple-100 px-2 py-0.5 rounded font-semibold text-[10px]">
                  Admin
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-emerald-800 text-[11px] text-emerald-300/80 flex items-center justify-between">
            <span>Problem Statement: SIH26087</span>
            <span>Ministry of Cooperation</span>
          </div>

          {/* Decorative background glow */}
          <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Right Side: Login / Register Form */}
        <div className="md:col-span-6 bg-white rounded-2xl p-8 border border-slate-200 shadow-xl flex flex-col justify-center">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isRegistering ? 'Create Member Account' : 'Welcome to CoopConnect'}
              </h3>
              <p className="text-xs text-slate-500">
                {isRegistering ? 'Register with your cooperative society ID' : 'Sign in to continue your learning journey'}
              </p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setIsRegistering(false); setError(''); }}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  !isRegistering ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsRegistering(true); setError(''); }}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  isRegistering ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cooperative Society / PACS Name</label>
                  <input
                    type="text"
                    value={formData.cooperativeSociety}
                    onChange={(e) => setFormData({ ...formData, cooperativeSociety: e.target.value })}
                    placeholder="e.g. Kaira District Co-operative Milk Producers Union"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    <option value="student">Student / Cooperative Member / PACS Staff</option>
                    <option value="trainer">Trainer / Faculty</option>
                    <option value="admin">Administrator / Registrar</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. ramesh.patel@coopconnect.in"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{isRegistering ? 'Complete Registration' : 'Sign In to Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Standard credentials: </span>
            <code className="text-emerald-700 font-bold bg-emerald-50 px-1 py-0.5 rounded">password123</code>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
