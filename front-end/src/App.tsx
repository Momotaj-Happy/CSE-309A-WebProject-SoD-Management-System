import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { StudentDuties } from './components/StudentDuties';
import { FacultyTaskAssignment } from './components/FacultyTaskAssignment';
import { UserDirectory } from './components/UserDirectory';
import { UserProfileCard } from './components/UserProfileCard';
import { SchedulePage } from './pages/SchedulePage';

const MainApp: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<string>('schedule');

  // Set default tab when user logs in or role changes
  useEffect(() => {
    if (user) {
      if (user.role === 'STUDENT') {
        setActiveTab('student-duties');
      } else if (user.role === 'FACULTY') {
        setActiveTab('faculty-tasks');
      } else {
        setActiveTab('directory');
      }
    }
  }, [user?.role]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-600 font-medium">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!isAuthenticated ? (
          authView === 'login' ? (
            <LoginForm onSwitchToRegister={() => setAuthView('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setAuthView('login')} />
          )
        ) : (
          <>
            {activeTab === 'student-duties' && <StudentDuties />}
            {activeTab === 'faculty-tasks' && <FacultyTaskAssignment />}
            {activeTab === 'directory' && <UserDirectory />}
            {activeTab === 'schedule' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <SchedulePage />
              </div>
            )}
            {activeTab === 'profile' && <UserProfileCard />}
          </>
        )}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
