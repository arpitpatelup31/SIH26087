import React, { useState, useEffect } from 'react';
import { aiApi, coursesApi } from '../services/api';
import { 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  Clock, 
  Layers, 
  BrainCircuit, 
  AlertTriangle,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export const RecommendationsPage = ({ onSelectCourse, onNavigate }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await aiApi.getRecommendations();
      setRecommendations(res.recommendations || []);
    } catch (err) {
      console.error('Error fetching recommendations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollAndStart = async (courseId) => {
    try {
      await coursesApi.enroll(courseId);
      onSelectCourse(courseId);
    } catch (err) {
      onSelectCourse(courseId);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">Retrieving personalized course recommendations from database...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Recommendation Engine (SIH26087)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Personalized Learning Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Targeted courses dynamically suggested by our AI Engine to eliminate skill gaps and prepare you for cooperative leadership and audits.
          </p>
        </div>

        <button
          onClick={() => onNavigate('skills')}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <BrainCircuit className="w-4 h-4 text-emerald-400" />
          <span>View Skill Gap Matrix</span>
        </button>
      </div>

      {/* Recommendations Grid */}
      {recommendations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No active recommendations</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Complete an assessment to generate personalized suggestions.</p>
          <button
            onClick={() => onNavigate('courses')}
            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg"
          >
            Explore Course Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <div
              key={rec.id || rec.course_id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-lg transition flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Rationale Top Tag */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 text-[11px] font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{rec.reason}</span>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {rec.course_category || rec.category || 'Cooperative Domain'}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {rec.course_level || rec.level || 'Beginner'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition line-clamp-2">
                    {rec.course_title || rec.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {rec.course_description || rec.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {rec.duration_hours || 4} Hours
                    </span>
                    <span className="font-semibold text-emerald-700">
                      Target: {rec.target_skill_name || rec.skill_name || 'Accounting'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => handleEnrollAndStart(rec.course_id || rec.id)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Start Learning Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default RecommendationsPage;
