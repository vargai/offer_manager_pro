import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import CreateRequestPage from './pages/CreateRequestPage';
import SubmitOfferPage from './pages/SubmitOfferPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import { DashboardIcon, CreateIcon, SparklesIcon, LoginIcon, LogoutIcon } from './components/common/Icons';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon className="w-5 h-5 mr-2" />, protected: true },
    { path: '/create-request', label: 'New Offer Request', icon: <CreateIcon className="w-5 h-5 mr-2" />, protected: true },
  ];

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center text-2xl font-bold text-sky-400 hover:text-sky-300 transition-colors">
          <SparklesIcon className="w-8 h-8 mr-2 text-amber-400" />
          OfferManager Pro
        </Link>
        <div className="flex items-center space-x-4">
          {navItems.map((item) => (
             (item.protected && !isAuthenticated) ? null : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ease-in-out
                    ${location.pathname === item.path 
                      ? 'bg-sky-500 text-white shadow-md scale-105' 
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )
          ))}
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-slate-700 hover:text-white transition-all duration-150 ease-in-out"
            >
              <LogoutIcon className="w-5 h-5 mr-2" />
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ease-in-out
                ${location.pathname === '/login'
                  ? 'bg-sky-500 text-white shadow-md scale-105' 
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
            >
              <LoginIcon className="w-5 h-5 mr-2" />
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/submit-offer/:requestId" element={<SubmitOfferPage />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/create-request" element={
              <ProtectedRoute>
                <CreateRequestPage />
              </ProtectedRoute>
            } />
            {/* Fallback route for any other undefined paths, redirecting to dashboard if logged in, or login if not */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="bg-slate-800 text-center text-sm text-gray-400 py-4">
          © {new Date().getFullYear()} OfferManager Pro. All rights reserved.
        </footer>
      </div>
  );
};

export default App;