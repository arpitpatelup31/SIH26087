import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  Award, 
  BrainCircuit, 
  Building2, 
  RefreshCw, 
  Activity, 
  BarChart3,
  Cpu,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const AdminDashboard = ({ onNavigate }) => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, usersRes] = await Promise.all([
        adminApi.getAnalytics(),
        adminApi.getUsers()
      ]);
      setAnalytics(analyticsRes);
      setUsers(usersRes.users || []);
    } catch (err) {
      console.error('Error loading admin analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, roleId) => {
    setUpdatingUser(userId);
    try {
      await adminApi.updateUserRole(userId, roleId);
      await loadAdminData();
    } catch (err) {
      alert('Error updating role: ' + err.message);
    } finally {
      setUpdatingUser(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading Ministry Admin & Registry Analytics...</p>
      </div>
    );
  }

  const metrics = analytics?.metrics || {};
  const skillGapStats = analytics?.skillGapStats || [];
  const societyStats = analytics?.societyStats || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-300 bg-purple-950/60 border border-purple-500/30 px-3 py-1 rounded-full">
            <ShieldCheck className="w-4 h-4" />
            <span>National Cooperative Portal Administrator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            System Administration & Skill Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Monitor national PACS digitization progress, identify cross-state skill gaps, manage member roles, and audit verifiable certificates.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/20 p-4 rounded-xl text-center self-start md:self-auto">
          <div className="text-2xl font-black text-emerald-400">{metrics.completionRate || 67}%</div>
          <div className="text-[10px] uppercase font-bold text-purple-200">Course Completion Rate</div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Members"
          value={metrics.totalUsers || users.length}
          subtitle="Across 3 States"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Active Courses"
          value={metrics.totalCourses || 5}
          subtitle="Cooperative Domains"
          icon={BookOpen}
          color="emerald"
        />
        <StatCard
          title="Certificates Issued"
          value={metrics.totalCertificates || 1}
          subtitle="QR Verifiable on Chain/DB"
          icon={Award}
          color="amber"
        />
        <StatCard
          title="Assessments Logged"
          value={metrics.totalQuizAttempts || 14}
          subtitle="AI Skill Vectors Processed"
          icon={BrainCircuit}
          color="blue"
        />
      </div>

      {/* Two Column Section: Skill Gap Heatmap & Cooperative Society Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left (7 cols): National Skill Gap Heatmap */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <span>National Skill Gap Heatmap (AI Analytics)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Identifies highest training deficits across registered cooperative societies
              </p>
            </div>
            <span className="text-[11px] font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
              Live Priority
            </span>
          </div>

          <div className="space-y-4">
            {skillGapStats.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{item.skill_name}</span>
                    <span className="text-slate-400 ml-2 text-[10px]">({item.category})</span>
                  </div>
                  <span className="font-extrabold text-slate-800">
                    Avg Score: {item.avg_score || 55}%
                  </span>
                </div>

                <ProgressBar progress={item.avg_score || 55} size="sm" showLabel={false} color={item.avg_score >= 80 ? 'emerald' : item.avg_score >= 60 ? 'amber' : 'orange'} />

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Assessed Members: <strong>{item.total_assessed}</strong></span>
                  <span className="text-orange-700 font-bold">
                    {item.gap_count || 1} Critical Gaps Identified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right (5 cols): Cooperative Societies Engagement */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <span>Society-Level Participation</span>
            </h2>
            <p className="text-xs text-slate-500">PACS, Dairy Unions & Handloom SHGs</p>
          </div>

          <div className="space-y-3">
            {societyStats.map((soc, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-xs text-slate-900 line-clamp-1">
                  {soc.cooperative_society}
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Members</span>
                    <strong className="text-slate-800">{soc.member_count}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Enrolled</span>
                    <strong className="text-slate-800">{soc.enrollment_count}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Certified</span>
                    <strong className="text-emerald-700">{soc.certificate_count}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* User Role Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>Cooperative User Directory & Role Assignment</span>
          </h3>
          <p className="text-xs text-slate-500">Manage learner, trainer, and administrator privileges</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Cooperative Society</th>
                <th className="py-3 px-4">Enrolled / Certified</th>
                <th className="py-3 px-4">Current Role</th>
                <th className="py-3 px-4 text-right">Assign Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <img
                      src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                      alt={u.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{u.name}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{u.email}</td>
                  <td className="py-3 px-4 text-slate-600 truncate max-w-[180px]">
                    {u.cooperative_society || 'General Cooperative'}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">
                    {u.enrolled_count || 0} / <span className="text-emerald-700 font-bold">{u.certificate_count || 0}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      u.role_name === 'admin' 
                        ? 'bg-purple-100 text-purple-800'
                        : u.role_name === 'trainer'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {u.role_name}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <select
                      value={u.role_id}
                      disabled={updatingUser === u.id}
                      onChange={(e) => handleRoleChange(u.id, Number(e.target.value))}
                      className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 outline-none"
                    >
                      <option value="1">Student</option>
                      <option value="2">Trainer</option>
                      <option value="3">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
