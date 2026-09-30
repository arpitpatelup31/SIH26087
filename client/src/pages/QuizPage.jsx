import React, { useState, useEffect } from 'react';
import { quizzesApi } from '../services/api';
import { useOfflineSync } from '../context/OfflineSyncContext';
import { 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  Sparkles,
  RefreshCw,
  Award
} from 'lucide-react';

export const QuizPage = ({ quizId, onBack, onCompleteQuiz }) => {
  const { isOnline, enqueueOfflineAction } = useOfflineSync();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: 'A' | 'B' | 'C' | 'D' }
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || submitting) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitting]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const res = await quizzesApi.getById(quizId);
      setQuizData(res.quiz);
      setTimeLeft((res.quiz.duration_mins || 10) * 60);
    } catch (err) {
      console.error('Error fetching quiz', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionKey) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const questions = quizData.questions || [];
      const answersPayload = questions.map(q => ({
        questionId: q.id,
        selectedOption: selectedAnswers[q.id] || '',
        skillId: q.skill_id
      }));

      if (isOnline) {
        const res = await quizzesApi.submit(quizId, answersPayload);
        onCompleteQuiz(res.result);
      } else {
        // Offline simulation handling
        const offlineResult = {
          quizId: Number(quizId),
          quizTitle: quizData.title,
          courseId: quizData.course_id,
          score: 80,
          totalQuestions: questions.length,
          correctAnswers: 4,
          passingScore: quizData.passing_score || 60,
          passed: true,
          evaluatedAnswers: [],
          skillPerformance: [
            { skill: 'Cooperative Accounting', score: 80 }
          ],
          aiAnalysis: {
            strengths: ['Cooperative Accounting'],
            skillGaps: [],
            recommendations: []
          }
        };

        enqueueOfflineAction('SUBMIT_QUIZ', 'quiz', {
          quizId: Number(quizId),
          courseId: quizData.course_id,
          answers: answersPayload,
          score: 80,
          passed: true
        });

        onCompleteQuiz(offlineResult);
      }
    } catch (err) {
      console.error('Error submitting quiz', err);
      alert('Error submitting assessment: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">Preparing assessment questions & skill tags...</p>
      </div>
    );
  }

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">No questions found for this quiz.</h2>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold">
          Return to Course
        </button>
      </div>
    );
  }

  const questions = quizData.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const options = [
    { key: 'A', text: currentQuestion.option_a },
    { key: 'B', text: currentQuestion.option_b },
    { key: 'C', text: currentQuestion.option_c },
    { key: 'D', text: currentQuestion.option_d },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Bar with Timer & Exit */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Quiz</span>
        </button>

        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
          </div>

          <span className="text-xs font-semibold text-slate-500">
            {answeredCount} of {questions.length} answered
          </span>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        
        {/* Question Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-orange-500" />
              Skill: {currentQuestion.skill_name}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Passing: {quizData.passing_score}%
          </span>
        </div>

        {/* Question Text */}
        <div className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
          {currentQuestion.question_text}
        </div>

        {/* Options List */}
        <div className="space-y-3 pt-2">
          {options.map((opt) => {
            const isSelected = selectedAnswers[currentQuestion.id] === opt.key;
            return (
              <div
                key={opt.key}
                onClick={() => handleSelectOption(currentQuestion.id, opt.key)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center space-x-3.5 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition ${
                  isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {opt.key}
                </div>
                <div className="text-xs sm:text-sm leading-relaxed">
                  {opt.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Pagination & Submit */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
          {/* Question Palette Dots */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {questions.map((q, idx) => {
              const isAns = !!selectedAnswers[q.id];
              const isCurr = currentQuestionIndex === idx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                    isCurr
                      ? 'ring-2 ring-emerald-600 bg-emerald-600 text-white'
                      : isAns
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Previous
            </button>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:bg-slate-300"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting Assessment...' : 'Submit Assessment'}</span>
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default QuizPage;
