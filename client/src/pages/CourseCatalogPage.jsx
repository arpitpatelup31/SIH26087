import React, { useState, useEffect } from 'react';
import { coursesApi } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Clock, 
  Layers, 
  User, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export const CourseCatalogPage = ({ onSelectCourse }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'All',
    'Finance & Accounting',
    'Digital Banking',
    'Governance & Legal',
    'Dairy & Agriculture',
    'Banking & Credit'
  ];

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, selectedLevel, searchQuery]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await coursesApi.getAll({
        category: selectedCategory,
        level: selectedLevel,
        search: searchQuery
      });
      setCourses(res.courses || []);
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (e, courseId) => {
    e.stopPropagation();
    try {
      await coursesApi.enroll(courseId);
      onSelectCourse(courseId);
    } catch (err) {
      console.error('Enrollment error', err);
      onSelectCourse(courseId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>National Council for Cooperative Training (NCCT) Certified</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Cooperative Training & Skill Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Standardized modules curated for PACS managers, cooperative banking staff, and dairy & handloom societies across India.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-80">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search courses, skills, PACS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Level Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Difficulty:</span>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none"
          >
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="text-center py-16">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading cooperative courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No courses match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try changing your search keywords or category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => onSelectCourse(course.id)}
              className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-lg transition flex flex-col justify-between overflow-hidden cursor-pointer group"
            >
              <div>
                {/* Thumbnail Header */}
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80'}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {course.category}
                    </span>
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {course.level}
                    </span>
                  </div>
                  {course.isEnrolled && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Enrolled</span>
                    </div>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3">
                  {course.target_skill_name && (
                    <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-500" />
                      <span>Skill: {course.target_skill_name}</span>
                    </div>
                  )}

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {course.duration_hours} Hours
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      {course.module_count || 3} Modules
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-5 pt-0">
                {course.isEnrolled ? (
                  <div className="space-y-2">
                    <ProgressBar progress={course.progressPercent || 0} size="sm" />
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectCourse(course.id); }}
                      className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Resume Course</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => handleEnroll(e, course.id)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Enroll Now (Free)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default CourseCatalogPage;
