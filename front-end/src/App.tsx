import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { UserDirectory } from './components/UserDirectory';
import { UserProfileCard } from './components/UserProfileCard';
import { RBACMatrix } from './components/RBACMatrix';
import { SchedulePage } from './pages/SchedulePage';

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<'directory' | 'schedule' | 'profile' | 'rbac'>('directory');

  if (isLoading) {
    return (
      <div className="app-container flex items-center justify-center min-h-screen">
        <div className="loading-state">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-300 font-medium">Initializing SoD Management Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {!isAuthenticated ? (
          authView === 'login' ? (
            <LoginForm onSwitchToRegister={() => setAuthView('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setAuthView('login')} />
          )
        ) : (
          <>
            {activeTab === 'directory' && <UserDirectory />}
            {activeTab === 'schedule' && (
              <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-md">
                <SchedulePage />
              </div>
            )}
            {activeTab === 'profile' && <UserProfileCard />}
            {activeTab === 'rbac' && <RBACMatrix />}
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
