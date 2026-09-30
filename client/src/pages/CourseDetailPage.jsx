import React, { useState, useEffect } from 'react';
import { coursesApi } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import { 
  BookOpen, 
  PlayCircle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  User, 
  Sparkles, 
  Award, 
  FileText, 
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Lock
} from 'lucide-react';

export const CourseDetailPage = ({ courseId, onBack, onSelectLesson, onSelectQuiz, onNavigate }) => {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      const res = await coursesApi.getById(courseId);
      setCourseData(res.course);
    } catch (err) {
      console.error('Error fetching course details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await coursesApi.enroll(courseId);
      await fetchCourseDetails();
    } catch (err) {
      console.error('Enroll error', err);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading course curriculum...</p>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Course Not Found</h2>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const isEnrolled = !!courseData.enrollment;
  const progressPercent = courseData.enrollment ? courseData.enrollment.progress_percent : 0;
  const isCompleted = progressPercent >= 100;
  const completedLessonIds = courseData.completedLessonIds || [];
  const passedQuizIds = courseData.passedQuizIds || [];

  // Find next uncompleted lesson
  let nextLessonId = null;
  if (courseData.modules && courseData.modules.length > 0) {
    for (const m of courseData.modules) {
      for (const l of m.lessons) {
        if (!completedLessonIds.includes(l.id)) {
          nextLessonId = l.id;
          break;
        }
      }
      if (nextLessonId) break;
    }
    // If all completed, default to first lesson
    if (!nextLessonId && courseData.modules[0].lessons.length > 0) {
      nextLessonId = courseData.modules[0].lessons[0].id;
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Link */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Course Catalog</span>
      </button>

      {/* Hero Course Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 font-bold text-[11px] px-2.5 py-0.5 rounded-full">
              {courseData.category}
            </span>
            <span className="bg-slate-100 text-slate-700 font-semibold text-[11px] px-2.5 py-0.5 rounded-full">
              {courseData.level} Level
            </span>
            {courseData.target_skill_name && (
              <span className="bg-orange-100 text-orange-800 font-bold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-orange-600" />
                Target Skill: {courseData.target_skill_name}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {courseData.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {courseData.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Instructor: <strong className="text-slate-800">{courseData.trainer_name || 'NCCT Faculty'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{courseData.duration_hours} Total Hours</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-400" />
              <span>{courseData.modules?.length || 0} Modules</span>
            </div>
          </div>
        </div>

        {/* Right CTA Card */}
        <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <img
              src={courseData.thumbnail || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80'}
              alt={courseData.title}
              className="w-full h-36 object-cover rounded-xl border border-slate-200 mb-4"
            />
            {isEnrolled ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">Course Progress</span>
                  <span className="text-emerald-700">{progressPercent}%</span>
                </div>
                <ProgressBar progress={progressPercent} size="md" showLabel={false} />
                <p className="text-[11px] text-slate-500">
                  {completedLessonIds.length} of {courseData.totalLessons || 4} lessons completed
                </p>
              </div>
            ) : (
              <div className="text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Free Cooperative Member Access</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Complete all module lessons and pass the assessment quiz to receive an authenticated completion certificate.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2">
            {isEnrolled ? (
              <>
                <button
                  onClick={() => nextLessonId && onSelectLesson(nextLessonId)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>{progressPercent === 0 ? 'Start Course' : isCompleted ? 'Review Lessons' : 'Continue Lesson'}</span>
                </button>
                {isCompleted && (
                  <button
                    onClick={() => onNavigate('certificates')}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>View Certificate</span>
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{enrolling ? 'Enrolling...' : 'Enroll in Course'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Detailed Syllabus Structure */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>Course Syllabus & Learning Modules</span>
          </h2>
          <p className="text-xs text-slate-500">
            Step-by-step curriculum with interactive quizzes and skill-gap evaluation
          </p>
        </div>

        <div className="space-y-6">
          {courseData.modules?.map((mod, mIdx) => (
            <div
              key={mod.id}
              className="border border-slate-200 rounded-xl overflow-hidden bg-white"
            >
              {/* Module Header */}
              <div className="bg-slate-50/80 p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    Module {mIdx + 1}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900">{mod.title}</h3>
                  {mod.description && <p className="text-xs text-slate-500 mt-0.5">{mod.description}</p>}
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {mod.lessons.length} Lessons {mod.quizzes?.length > 0 ? '+ 1 Quiz' : ''}
                </span>
              </div>

              {/* Lessons List */}
              <div className="divide-y divide-slate-100">
                {mod.lessons.map((lesson, lIdx) => {
                  const isLessonDone = completedLessonIds.includes(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => isEnrolled ? onSelectLesson(lesson.id) : handleEnroll()}
                      className="p-3.5 sm:px-5 flex items-center justify-between hover:bg-emerald-50/30 transition cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          isLessonDone ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isLessonDone ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : `${mIdx + 1}.${lIdx + 1}`}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition">
                            {lesson.title}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3 text-slate-400" />
                              Interactive Reading & Practice
                            </span>
                            <span>•</span>
                            <span>{lesson.duration_mins || 15} mins</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isLessonDone ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Completed
                          </span>
                        ) : (
                          <button className="text-xs font-bold text-slate-400 group-hover:text-emerald-700 flex items-center gap-1">
                            <span>Open</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Module Quizzes */}
                {mod.quizzes?.map((quiz) => {
                  const isQuizPassed = passedQuizIds.includes(quiz.id);
                  return (
                    <div
                      key={quiz.id}
                      onClick={() => onSelectQuiz(quiz.id)}
                      className="p-3.5 sm:px-5 bg-orange-50/40 hover:bg-orange-50/80 border-t border-orange-100 flex items-center justify-between transition cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          isQuizPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {isQuizPassed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <HelpCircle className="w-4 h-4 text-orange-600" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-orange-900 group-hover:text-orange-700 transition flex items-center gap-2">
                            <span>{quiz.title}</span>
                            <span className="text-[10px] bg-orange-200/60 text-orange-800 font-bold px-1.5 py-0.2 rounded">
                              AI Skill Check
                            </span>
                          </div>
                          <div className="text-[11px] text-orange-700/80 flex items-center gap-2 mt-0.5">
                            <span>{quiz.question_count || 5} Questions</span>
                            <span>•</span>
                            <span>Passing: {quiz.passing_score}%</span>
                          </div>
                        </div>
                      </div>

                      <button className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-lg transition shadow-2xs">
                        {isQuizPassed ? 'Retake Quiz' : 'Take Quiz →'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CourseDetailPage;
