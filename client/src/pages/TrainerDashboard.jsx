import React, { useState, useEffect } from 'react';
import { trainerApi, coursesApi } from '../services/api';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import { 
  GraduationCap, 
  PlusCircle, 
  BookOpen, 
  Users, 
  Award, 
  HelpCircle, 
  CheckCircle2, 
  FileText, 
  Clock, 
  RefreshCw,
  Layers,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export const TrainerDashboard = ({ onNavigate, onSelectCourse }) => {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);
  const [selectedCourseForAction, setSelectedCourseForAction] = useState(null);

  // Form states
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'Finance & Accounting',
    level: 'Beginner',
    duration_hours: 4,
    target_skill_id: 1,
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80'
  });

  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: ''
  });

  const [quizForm, setQuizForm] = useState({
    title: '',
    passing_score: 60,
    duration_mins: 15,
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    skill_id: 1,
    explanation: ''
  });

  useEffect(() => {
    loadTrainerData();
  }, []);

  const loadTrainerData = async () => {
    setLoading(true);
    try {
      const res = await trainerApi.getStats();
      setStats(res.stats);
      setCourses(res.courses || []);
      setRecentAssessments(res.recentAssessments || []);
      if (res.courses && res.courses.length > 0) {
        setSelectedCourseForAction(res.courses[0]);
      }
    } catch (err) {
      console.error('Error loading trainer data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await trainerApi.createCourse(courseForm);
      setIsCreateCourseOpen(false);
      setCourseForm({
        title: '',
        description: '',
        category: 'Finance & Accounting',
        level: 'Beginner',
        duration_hours: 4,
        target_skill_id: 1,
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80'
      });
      await loadTrainerData();
    } catch (err) {
      alert('Error creating course: ' + err.message);
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!selectedCourseForAction) return;
    try {
      await trainerApi.addModule(selectedCourseForAction.id, moduleForm);
      setIsAddModuleOpen(false);
      setModuleForm({ title: '', description: '' });
      await loadTrainerData();
    } catch (err) {
      alert('Error adding module: ' + err.message);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!selectedCourseForAction) return;
    try {
      await trainerApi.createQuiz(selectedCourseForAction.id, {
        title: quizForm.title,
        passing_score: quizForm.passing_score,
        duration_mins: quizForm.duration_mins,
        questions: [
          {
            question_text: quizForm.question_text,
            option_a: quizForm.option_a,
            option_b: quizForm.option_b,
            option_c: quizForm.option_c,
            option_d: quizForm.option_d,
            correct_option: quizForm.correct_option,
            skill_id: quizForm.skill_id,
            explanation: quizForm.explanation
          }
        ]
      });
      setIsCreateQuizOpen(false);
      await loadTrainerData();
    } catch (err) {
      alert('Error creating quiz: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading Trainer Studio & Learner Analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-orange-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-200 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full">
            <GraduationCap className="w-4 h-4" />
            <span>Certified Cooperative Educator Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Trainer & Curriculum Studio
          </h1>
          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
            Create accredited cooperative training courses, structure module lessons, craft skill-tagged MCQ assessments, and monitor learner competencies.
          </p>
        </div>

        <button
          onClick={() => setIsCreateCourseOpen(true)}
          className="px-5 py-3 bg-white text-slate-900 hover:bg-amber-50 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-amber-600" />
          <span>Create New Course</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Courses Authored"
          value={stats?.totalCourses || courses.length}
          subtitle="Published on Portal"
          icon={BookOpen}
          color="amber"
        />
        <StatCard
          title="Enrolled Cooperative Members"
          value={stats?.totalLearners || 12}
          subtitle="Across PACS & Dairy Unions"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Assessments Conducted"
          value={stats?.totalAttempts || 28}
          subtitle="AI Skill Analysis Triggered"
          icon={HelpCircle}
          color="blue"
        />
        <StatCard
          title="Average Member Score"
          value={`${stats?.averageScore || 78}%`}
          subtitle="Passing benchmark: 60%"
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Course Management & Module Builder */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              <span>Authored Courses & Syllabus Management</span>
            </h2>
            <p className="text-xs text-slate-500">Manage modules, lessons, and assessment questions</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (courses.length > 0) {
                  setSelectedCourseForAction(courses[0]);
                  setIsAddModuleOpen(true);
                }
              }}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Module</span>
            </button>

            <button
              onClick={() => {
                if (courses.length > 0) {
                  setSelectedCourseForAction(courses[0]);
                  setIsCreateQuizOpen(true);
                }
              }}
              className="px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold text-xs rounded-lg border border-orange-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-orange-600" />
              <span>Add Skill Quiz</span>
            </button>
          </div>
        </div>

        {/* Courses List */}
        <div className="space-y-4">
          {courses.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-amber-300 bg-white hover:bg-amber-50/10 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <img
                    src={c.thumbnail || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=300&q=80'}
                    alt={c.title}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {c.category}
                      </span>
                      {c.target_skill_name && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          Skill: {c.target_skill_name}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">{c.title}</h3>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-0.5">
                      <span>{c.module_count || 3} Modules</span>
                      <span>•</span>
                      <span>{c.lesson_count || 4} Lessons</span>
                      <span>•</span>
                      <span>{c.enrolled_count || 0} Enrolled Members</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => {
                      setSelectedCourseForAction(c);
                      setIsAddModuleOpen(true);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition"
                  >
                    + Module
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCourseForAction(c);
                      setIsCreateQuizOpen(true);
                    }}
                    className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold text-xs rounded-lg transition"
                  >
                    + Quiz
                  </button>
                  <button
                    onClick={() => onSelectCourse(c.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Assessment Submissions by Members */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Recent Learner Assessment Submissions</span>
          </h3>
          <p className="text-xs text-slate-500">Live evaluation log from cooperative members</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Cooperative Society</th>
                <th className="py-3 px-4">Course / Quiz</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4 text-right">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAssessments.map((sub, idx) => (
                <tr key={sub.id || idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900">{sub.student_name || 'Ramesh Patel'}</td>
                  <td className="py-3 px-4 text-slate-600 truncate max-w-[180px]">{sub.cooperative_society || 'Kaira Dairy Union'}</td>
                  <td className="py-3 px-4 text-slate-700">{sub.quiz_title || sub.course_title}</td>
                  <td className="py-3 px-4 font-black">{Math.round(sub.score)}%</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      sub.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {sub.passed ? 'Passed ✓' : 'Failed ✗'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-right">
                    {new Date(sub.completed_at || Date.now()).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Course */}
      {isCreateCourseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <h3 className="font-bold text-base text-slate-900">Create New Cooperative Course</h3>
            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="e.g. PACS Electronic Day Book & Cash Ledger"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Cooperative curriculum summary..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  >
                    <option value="Finance & Accounting">Finance & Accounting</option>
                    <option value="Digital Banking">Digital Banking</option>
                    <option value="Governance & Legal">Governance & Legal</option>
                    <option value="Dairy & Agriculture">Dairy & Agriculture</option>
                    <option value="Banking & Credit">Banking & Credit</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Level</label>
                  <select
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateCourseOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Module */}
      {isAddModuleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h3 className="font-bold text-base text-slate-900">Add Module to "{selectedCourseForAction?.title}"</h3>
            <form onSubmit={handleAddModule} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Module Title</label>
                <input
                  type="text"
                  required
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  placeholder="e.g. Module 4: Statutory Audit Preparation"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  placeholder="Module objectives..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModuleOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg"
                >
                  Add Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Quiz */}
      {isCreateQuizOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-slate-900">Add Skill MCQ Quiz & Question</h3>
            <form onSubmit={handleCreateQuiz} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Quiz Title</label>
                <input
                  type="text"
                  required
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  placeholder="e.g. PACS Day Book Balancing Assessment"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">MCQ Question Text</label>
                <textarea
                  required
                  rows={2}
                  value={quizForm.question_text}
                  onChange={(e) => setQuizForm({ ...quizForm, question_text: e.target.value })}
                  placeholder="e.g. Which voucher is prepared for non-cash adjustment entries?"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 mb-0.5">Option A</label>
                  <input
                    type="text"
                    required
                    value={quizForm.option_a}
                    onChange={(e) => setQuizForm({ ...quizForm, option_a: e.target.value })}
                    placeholder="Transfer Voucher"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-0.5">Option B</label>
                  <input
                    type="text"
                    required
                    value={quizForm.option_b}
                    onChange={(e) => setQuizForm({ ...quizForm, option_b: e.target.value })}
                    placeholder="Payment Voucher"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-0.5">Option C</label>
                  <input
                    type="text"
                    required
                    value={quizForm.option_c}
                    onChange={(e) => setQuizForm({ ...quizForm, option_c: e.target.value })}
                    placeholder="Receipt Voucher"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-0.5">Option D</label>
                  <input
                    type="text"
                    required
                    value={quizForm.option_d}
                    onChange={(e) => setQuizForm({ ...quizForm, option_d: e.target.value })}
                    placeholder="None of these"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Correct Option</label>
                  <select
                    value={quizForm.correct_option}
                    onChange={(e) => setQuizForm({ ...quizForm, correct_option: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Skill Tag</label>
                  <select
                    value={quizForm.skill_id}
                    onChange={(e) => setQuizForm({ ...quizForm, skill_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  >
                    <option value="1">Cooperative Accounting</option>
                    <option value="2">Digital Literacy & DBT</option>
                    <option value="3">PACS Governance & Bye-laws</option>
                    <option value="4">Dairy Cold Chain</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateQuizOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg"
                >
                  Create Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TrainerDashboard;
