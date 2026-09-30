import React, { useState, useEffect } from 'react';
import { lessonsApi } from '../services/api';
import { useOfflineSync } from '../context/OfflineSyncContext';
import { 
  BookOpen, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  PlayCircle, 
  HelpCircle, 
  FileText, 
  Volume2, 
  Bookmark, 
  Share2,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const LessonViewerPage = ({ lessonId, onBack, onSelectLesson, onSelectQuiz }) => {
  const { isOnline, enqueueOfflineAction } = useOfflineSync();
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    setLoading(true);
    try {
      const res = await lessonsApi.getById(lessonId);
      setLessonData(res.lesson);
      setIsCompleted(res.lesson.isCompleted);
    } catch (err) {
      console.error('Error fetching lesson', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    setCompleting(true);
    try {
      if (isOnline) {
        await lessonsApi.complete(lessonId);
      } else {
        // Enqueue offline action for sync queue
        enqueueOfflineAction('COMPLETE_LESSON', 'lesson', {
          lessonId: Number(lessonId),
          courseId: lessonData.course_id
        });
      }
      setIsCompleted(true);
    } catch (err) {
      console.error('Error marking lesson completed', err);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading lesson content...</p>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Lesson Not Found</h2>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold">
          Back to Course
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {lessonData.course_title}</span>
        </button>

        <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
          <span className="text-slate-500">
            Lesson {lessonData.currentIndex} of {lessonData.totalLessonsInCourse}
          </span>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Completed
            </span>
          )}
        </div>
      </div>

      {/* Main Lesson Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Lesson Title Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 sm:p-8">
          <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block mb-1">
            {lessonData.module_title}
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {lessonData.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-200 mt-4 pt-4 border-t border-emerald-700/60">
            <span>Reading duration: <strong>{lessonData.duration_mins || 15} mins</strong></span>
            <span>•</span>
            <span>Domain: <strong>{lessonData.course_category}</strong></span>
          </div>
        </div>

        {/* Audio Summary Bar (Indian Rural Voice Assistant simulation) */}
        <div className="bg-emerald-50/70 border-b border-emerald-100 p-3.5 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition cursor-pointer"
            >
              <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
            </button>
            <div>
              <div className="text-xs font-bold text-emerald-900">Audio Narration (Bilingual: Hindi / English)</div>
              <div className="text-[10px] text-emerald-700">Listen to key cooperative accounting concepts on the go</div>
            </div>
          </div>
          {isPlayingAudio && (
            <span className="text-[11px] font-bold text-emerald-700 animate-pulse">
              Playing Audio...
            </span>
          )}
        </div>

        {/* Lesson Body Content */}
        <div className="p-6 sm:p-10 space-y-6 text-slate-800 text-sm leading-relaxed max-w-none prose prose-slate">
          {lessonData.content.split('\n\n').map((paragraph, pIdx) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={pIdx} className="text-lg font-bold text-slate-900 mt-6 mb-2 border-b border-slate-100 pb-1">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('#### ')) {
              return (
                <h4 key={pIdx} className="text-sm font-bold text-emerald-800 mt-4 mb-1">
                  {paragraph.replace('#### ', '')}
                </h4>
              );
            }
            if (paragraph.startsWith('* ') || paragraph.startsWith('- ')) {
              const items = paragraph.split('\n');
              return (
                <ul key={pIdx} className="list-disc pl-5 space-y-1.5 my-3 text-slate-700">
                  {items.map((it, iIdx) => (
                    <li key={iIdx}>{it.replace(/^[\*\-]\s+/, '')}</li>
                  ))}
                </ul>
              );
            }
            if (/^\d+\.\s/.test(paragraph)) {
              const items = paragraph.split('\n');
              return (
                <ol key={pIdx} className="list-decimal pl-5 space-y-1.5 my-3 text-slate-700">
                  {items.map((it, iIdx) => (
                    <li key={iIdx}>{it.replace(/^\d+\.\s+/, '')}</li>
                  ))}
                </ol>
              );
            }
            return (
              <p key={pIdx} className="text-slate-700 leading-relaxed">
                {paragraph}
              </p>
            );
          })}

          {/* Key Takeaways Box */}
          <div className="mt-8 p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Cooperative Practice Checklist:</span>
            </h4>
            <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
              <li>Always verify physical cash against the Cash Book (Rokar Bahi) before daily closure.</li>
              <li>Dual authorization signatures of Secretary and Treasurer are mandatory for voucher approval.</li>
              <li>Synchronize PACS offline logs to cloud database daily when connectivity is restored.</li>
            </ul>
          </div>
        </div>

        {/* Footer Navigation & Completion Bar */}
        <div className="bg-slate-50 p-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            {lessonData.prevLesson ? (
              <button
                onClick={() => onSelectLesson(lessonData.prevLesson.id)}
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Lesson</span>
              </button>
            ) : <div />}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleCompleteLesson}
              disabled={completing || isCompleted}
              className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? 'Completed ✓' : completing ? 'Marking...' : 'Mark Lesson Complete'}</span>
            </button>

            {lessonData.nextLesson ? (
              <button
                onClick={() => onSelectLesson(lessonData.nextLesson.id)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Next Lesson</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : lessonData.moduleQuiz ? (
              <button
                onClick={() => onSelectQuiz(lessonData.moduleQuiz.id)}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Take Module Quiz →</span>
              </button>
            ) : null}
          </div>
        </div>

      </div>

    </div>
  );
};

export default LessonViewerPage;
