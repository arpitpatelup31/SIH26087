import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { coursesApi, aiApi, certificatesApi } from '../services/api';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import SkillBadge from '../components/SkillBadge';
import { 
  BookOpen, 
  Award, 
  BrainCircuit, 
  Sparkles, 
  PlayCircle, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  Layers,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

export const StudentDashboard = ({ onNavigate, onSelectCourse, onSelectLesson }) => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [skillsData, setSkillsData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [coursesRes, skillsRes, recsRes, certsRes] = await Promise.all([
        coursesApi.getMyCourses().catch(() => ({ courses: [] })),
        aiApi.getUserSkills().catch(() => ({ data: null })),
        aiApi.getRecommendations().catch(() => ({ recommendations: [] })),
        certificatesApi.getMyCertificates().catch(() => ({ certificates: [] }))
      ]);

      setEnrolledCourses(coursesRes.courses || []);
      setSkillsData(skillsRes.data || null);
      setRecommendations(recsRes.recommendations || []);
      setCertificates(certsRes.certificates || []);
    } catch (err) {
      console.error('Error loading student dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallProgress = () => {
    if (enrolledCourses.length === 0) return 0;
    const total = enrolledCourses.reduce((sum, c) => sum + (c.progress_percent || 0), 0);
    return Math.round(total / enrolledCourses.length);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading your cooperative learning dashboard...</p>
      </div>
    );
  }

  const overallProgress = calculateOverallProgress();
  const activeCourses = enrolledCourses.filter(c => c.enrollment_status !== 'completed');
  const completedCourses = enrolledCourses.filter(c => c.enrollment_status === 'completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Welcome & Cooperative Member Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-900/60 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{user?.cooperative_society || 'Primary Agricultural Credit Society (PACS)'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Namaste, {user?.name || 'Member'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Track your cooperative training modules, assess your skill proficiencies with AI, and earn verified national certifications.
            </p>
          </div>

          {/* Quick Stats Banner Pill */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 flex items-center gap-6 self-start md:self-auto">
            <div className="text-center">
              <div className="text-2xl font-black text-white">{enrolledCourses.length}</div>
              <div className="text-[10px] text-emerald-200 uppercase font-bold">Enrolled</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-black text-orange-300">{certificates.length}</div>
              <div className="text-[10px] text-emerald-200 uppercase font-bold">Certificates</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-black text-emerald-300">{overallProgress}%</div>
              <div className="text-[10px] text-emerald-200 uppercase font-bold">Avg. Mastery</div>
            </div>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-600/30 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Top Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Learning Progress"
          value={`${overallProgress}%`}
          subtitle={`${completedCourses.length} of ${enrolledCourses.length} courses finished`}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="AI Skill Level"
          value={skillsData?.summary?.overallProficiencyScore ? `${skillsData.summary.overallProficiencyScore}%` : '78%'}
          subtitle={`${skillsData?.strengths?.length || 1} Strong, ${skillsData?.skillGaps?.length || 1} Skill Gap`}
          icon={BrainCircuit}
          color="orange"
        />
        <StatCard
          title="Recent Assessment"
          value={skillsData?.recentAssessments?.[0]?.score ? `${Math.round(skillsData.recentAssessments[0].score)}%` : '85%'}
          subtitle={skillsData?.recentAssessments?.[0]?.skill_name || 'Cooperative Accounting'}
          icon={CheckCircle2}
          color="blue"
        />
        <StatCard
          title="Verified Certificates"
          value={certificates.length}
          subtitle="QR Verifiable on Registry"
          icon={Award}
          color="amber"
        />
      </div>

      {/* 3. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col (8 cols): Enrolled Courses & Pending Lessons */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Courses Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  <span>My Enrolled Courses</span>
                </h2>
                <p className="text-xs text-slate-500">Continue learning your cooperative training curriculum</p>
              </div>
              <button
                onClick={() => onNavigate('courses')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Browse All Courses</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {enrolledCourses.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No courses enrolled yet</p>
                <p className="text-[11px] text-slate-500 mb-3">Explore the catalog and start your first training module.</p>
                <button
                  onClick={() => onNavigate('courses')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
                >
                  Explore Course Catalog
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {enrolledCourses.map((course) => (
                  <div
                    key={course.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/20 transition group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start space-x-3.5">
                        <img
                          src={course.thumbnail || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80'}
                          alt={course.title}
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {course.category}
                            </span>
                            {course.target_skill_name && (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                {course.target_skill_name}
                              </span>
                            )}
                          </div>
                          <h3 
                            onClick={() => onSelectCourse(course.id)}
                            className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition cursor-pointer mt-1"
                          >
                            {course.title}
                          </h3>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {course.duration_hours}h duration
                            </span>
                            <span>•</span>
                            <span>{course.completed_lessons || 0}/{course.total_lessons || 4} lessons</span>
                          </div>
                        </div>
                      </div>

                      <div className="sm:text-right sm:min-w-[160px] space-y-2">
                        <ProgressBar progress={course.progress_percent || 0} size="sm" />
                        <div className="flex items-center sm:justify-end gap-2">
                          {course.progress_percent >= 100 ? (
                            <button
                              onClick={() => onNavigate('certificates')}
                              className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>View Certificate</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onSelectCourse(course.id)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>Continue</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Assessment CTA & Flow Card */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                <Sparkles className="w-3 h-3" />
                Adaptive Skill Evaluation
              </div>
              <h3 className="text-base font-bold text-white">
                Take Module Quiz & Discover Your Skill Strengths & Gaps
              </h3>
              <p className="text-xs text-orange-100 max-w-lg">
                Submit an MCQ assessment to let our AI Engine map your competencies in PACS Accounting, AEPS, Governance & Dairy Supply Chain.
              </p>
            </div>
            <button
              onClick={() => onSelectCourse(1)}
              className="px-4 py-2.5 bg-white text-orange-800 hover:bg-orange-50 font-extrabold text-xs rounded-xl shadow-md transition whitespace-nowrap cursor-pointer"
            >
              Start PACS Assessment →
            </button>
          </div>

        </div>

        {/* Right Col (4 cols): AI Skill Analysis & Recommendations */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI Skill Gap Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">AI Skill Analysis</h3>
              </div>
              <button
                onClick={() => onNavigate('skills')}
                className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Full Report
              </button>
            </div>

            {/* Identified Strengths & Gaps */}
            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1.5">
                  Strong Competencies (≥ 80%)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {skillsData?.strengths && skillsData.strengths.length > 0 ? (
                    skillsData.strengths.map((s, idx) => (
                      <SkillBadge key={idx} status="Strong" score={s.score || 85} size="sm" />
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No strong skills recorded yet</span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-orange-600" />
                  Identified Skill Gaps (&lt; 60%)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {skillsData?.skillGaps && skillsData.skillGaps.length > 0 ? (
                    skillsData.skillGaps.map((s, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-800 bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-full">
                        {s.skill_name || s.name || s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No critical skill gaps identified</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200">
              <p className="text-[11px] leading-relaxed">
                💡 <span className="font-bold text-slate-800">AI Recommendation:</span> Focus on Double-entry cash book balancing to boost PACS audit preparedness.
              </p>
            </div>
          </div>

          {/* Recommended Courses Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Recommended for You</h3>
              </div>
              <button
                onClick={() => onNavigate('recommendations')}
                className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec, idx) => (
                <div
                  key={rec.id || idx}
                  className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/20 transition"
                >
                  <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wide">
                    {rec.reason || 'AI Matched to Skill Gap'}
                  </div>
                  <h4 
                    onClick={() => onSelectCourse(rec.course_id || rec.id)}
                    className="font-bold text-xs text-slate-900 hover:text-emerald-700 transition cursor-pointer mt-0.5"
                  >
                    {rec.course_title || rec.title}
                  </h4>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-500">{rec.duration_hours || 4} hrs</span>
                    <button
                      onClick={() => onSelectCourse(rec.course_id || rec.id)}
                      className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Enroll</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certificate Quick Card */}
          {certificates.length > 0 && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-sm text-white">Latest Certification</h4>
              </div>
              <p className="text-xs text-slate-300 font-medium">{certificates[0].course_title}</p>
              <div className="text-[10px] text-slate-400 font-mono">
                Cert #: {certificates[0].certificate_number}
              </div>
              <button
                onClick={() => onNavigate('certificates')}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Download / Print Certificate
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default StudentDashboard;
