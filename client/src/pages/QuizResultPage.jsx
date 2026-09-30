import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import SkillBadge from '../components/SkillBadge';
import { 
  CheckCircle2, 
  XCircle, 
  Award, 
  BrainCircuit, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  BookOpen,
  ChevronDown,
  Layers,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

export const QuizResultPage = ({ resultData, onNavigate, onRetakeQuiz, onSelectCourse }) => {
  useEffect(() => {
    if (resultData?.passed) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.warn('Confetti error', e);
      }
    }
  }, [resultData]);

  if (!resultData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">No Assessment Result Available</h2>
        <button
          onClick={() => onNavigate('dashboard')}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const {
    quizTitle,
    courseTitle,
    score,
    totalQuestions,
    correctAnswers,
    passed,
    passingScore = 60,
    skillPerformance = [],
    aiAnalysis,
    certificate,
    evaluatedAnswers = []
  } = resultData;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Main Score Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 text-center space-y-4 relative overflow-hidden">
        
        {/* Status Icon */}
        <div className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-lg ${
          passed 
            ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-600/20' 
            : 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-orange-500/20'
        }`}>
          {passed ? <CheckCircle2 className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
        </div>

        <div>
          <span className={`inline-block text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full mb-2 ${
            passed ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
          }`}>
            {passed ? 'Assessment Passed ✓' : 'Needs Practice (Retake Available)'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            You Scored {score}%
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {quizTitle} — {courseTitle}
          </p>
        </div>

        {/* Breakdown Stats */}
        <div className="max-w-md mx-auto grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <div className="font-extrabold text-slate-800 text-base">{correctAnswers} / {totalQuestions}</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Correct</div>
          </div>
          <div className="border-x border-slate-200">
            <div className="font-extrabold text-slate-800 text-base">{passingScore}%</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Passing Mark</div>
          </div>
          <div>
            <div className="font-extrabold text-emerald-700 text-base">{score >= 90 ? 'Grade A+' : score >= 75 ? 'Grade A' : 'Grade B'}</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Evaluation</div>
          </div>
        </div>

        {/* Certificate Unlocked Banner */}
        {certificate && (
          <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-xs flex items-center justify-between gap-4 max-w-md mx-auto text-left">
            <div className="flex items-center space-x-3">
              <Award className="w-8 h-8 text-white shrink-0" />
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-amber-100">Certificate Unlocked!</div>
                <div className="text-[11px] font-mono text-white">Cert #: {certificate.certificate_number}</div>
              </div>
            </div>
            <button
              onClick={() => onNavigate('certificates')}
              className="px-3 py-1.5 bg-white text-slate-900 font-extrabold text-xs rounded-lg shadow-sm hover:bg-amber-50 transition whitespace-nowrap cursor-pointer"
            >
              View Certificate
            </button>
          </div>
        )}
      </div>

      {/* 2. AI Skill Performance Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                AI Skill Gap Evaluation & Competency Matrix
              </h2>
              <p className="text-xs text-slate-500">
                Automated skill categorization based on your assessment responses
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('skills')}
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Full AI Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Skill Scores Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skillPerformance.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-slate-800">{item.skill}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Assessed Score: <strong className="text-slate-800">{item.score}%</strong>
                </div>
              </div>
              <SkillBadge
                status={item.score >= 80 ? 'Strong' : item.score >= 60 ? 'Developing' : 'Skill Gap'}
                score={item.score}
              />
            </div>
          ))}
        </div>

        {/* AI Recommendations Callout */}
        {aiAnalysis?.recommendations && aiAnalysis.recommendations.length > 0 && (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>AI Recommended Courses for Skill Mastery</span>
              </h3>
              <button
                onClick={() => onNavigate('recommendations')}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                View Catalog
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {aiAnalysis.recommendations.slice(0, 2).map((rec, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectCourse(rec.course_id || rec.id)}
                  className="p-3 bg-white rounded-lg border border-emerald-100 hover:border-emerald-300 transition cursor-pointer shadow-2xs"
                >
                  <div className="text-[10px] font-bold text-orange-600">{rec.reason}</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5 hover:text-emerald-700">
                    {rec.course_title || rec.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Question-by-Question Review */}
      {evaluatedAnswers.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-slate-600" />
              <span>Assessment Review & Explanations</span>
            </h3>
            <p className="text-xs text-slate-500">
              Detailed breakdown of correct answers and statutory references
            </p>
          </div>

          <div className="space-y-4 divide-y divide-slate-100">
            {evaluatedAnswers.map((item, idx) => (
              <div key={idx} className="pt-4 first:pt-0 space-y-2.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="text-xs font-bold text-slate-900 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{item.questionText}</span>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                    item.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                  </span>
                </div>

                <div className="pl-7 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className={`p-2 rounded-lg border ${
                    item.isCorrect 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' 
                      : 'bg-red-50 border-red-200 text-red-900 font-semibold'
                  }`}>
                    Your Answer: <strong>Option {item.selectedOption || 'None'}</strong>
                  </div>
                  <div className="p-2 rounded-lg border bg-slate-50 border-slate-200 text-slate-800 font-medium">
                    Correct Answer: <strong className="text-emerald-700">Option {item.correctOption}</strong>
                  </div>
                </div>

                {item.explanation && (
                  <div className="pl-7 text-[11px] text-slate-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                    <strong className="text-amber-900">Cooperative Note:</strong> {item.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
        >
          Return to Dashboard
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('skills')}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>View Full AI Skill Analysis</span>
          </button>
          
          <button
            onClick={() => onNavigate('recommendations')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Recommended Courses →</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default QuizResultPage;
