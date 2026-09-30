import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OfflineSyncProvider } from './context/OfflineSyncContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import OfflineSyncModal from './components/OfflineSyncModal';

// Pages
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import CourseCatalogPage from './pages/CourseCatalogPage';
import CourseDetailPage from './pages/CourseDetailPage';
import LessonViewerPage from './pages/LessonViewerPage';
import QuizPage from './pages/QuizPage';
import QuizResultPage from './pages/QuizResultPage';
import AiSkillAnalysisPage from './pages/AiSkillAnalysisPage';
import RecommendationsPage from './pages/RecommendationsPage';
import CertificatesPage from './pages/CertificatesPage';
import TrainerDashboard from './pages/TrainerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function MainApp() {
  const { user, isAuthenticated, loading } = useAuth();
  
  // Navigation & View Routing State
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [lastQuizResult, setLastQuizResult] = useState(null);

  // Navigation handlers
  const handleNavigate = (tab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setCurrentTab('course-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectLesson = (lessonId) => {
    setSelectedLessonId(lessonId);
    setCurrentTab('lesson-viewer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectQuiz = (quizId) => {
    setSelectedQuizId(quizId);
    setCurrentTab('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteQuiz = (result) => {
    setLastQuizResult(result);
    setCurrentTab('quiz-result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center mx-auto animate-pulse">
            C
          </div>
          <p className="text-xs font-bold text-slate-600">Initializing CoopConnect LMS...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && currentTab !== 'login') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <LoginPage onNavigate={handleNavigate} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation */}
      <Navbar currentTab={currentTab} onNavigate={handleNavigate} />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentTab === 'login' && (
          <LoginPage onNavigate={handleNavigate} />
        )}

        {currentTab === 'dashboard' && (
          <StudentDashboard 
            onNavigate={handleNavigate}
            onSelectCourse={handleSelectCourse}
            onSelectLesson={handleSelectLesson}
          />
        )}

        {currentTab === 'courses' && (
          <CourseCatalogPage 
            onSelectCourse={handleSelectCourse}
          />
        )}

        {currentTab === 'course-detail' && (
          <CourseDetailPage 
            courseId={selectedCourseId || 1}
            onBack={() => handleNavigate('courses')}
            onSelectLesson={handleSelectLesson}
            onSelectQuiz={handleSelectQuiz}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'lesson-viewer' && (
          <LessonViewerPage 
            lessonId={selectedLessonId || 1}
            onBack={() => handleNavigate('course-detail')}
            onSelectLesson={handleSelectLesson}
            onSelectQuiz={handleSelectQuiz}
          />
        )}

        {currentTab === 'quiz' && (
          <QuizPage 
            quizId={selectedQuizId || 1}
            onBack={() => handleNavigate('course-detail')}
            onCompleteQuiz={handleCompleteQuiz}
          />
        )}

        {currentTab === 'quiz-result' && (
          <QuizResultPage 
            resultData={lastQuizResult}
            onNavigate={handleNavigate}
            onRetakeQuiz={() => handleSelectQuiz(selectedQuizId || 1)}
            onSelectCourse={handleSelectCourse}
          />
        )}

        {currentTab === 'skills' && (
          <AiSkillAnalysisPage 
            onNavigate={handleNavigate}
            onSelectCourse={handleSelectCourse}
          />
        )}

        {currentTab === 'recommendations' && (
          <RecommendationsPage 
            onSelectCourse={handleSelectCourse}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'certificates' && (
          <CertificatesPage 
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'trainer' && (
          <TrainerDashboard 
            onNavigate={handleNavigate}
            onSelectCourse={handleSelectCourse}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard 
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Offline Sync Architecture Modal */}
      <OfflineSyncModal />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <OfflineSyncProvider>
        <MainApp />
      </OfflineSyncProvider>
    </AuthProvider>
  );
}
