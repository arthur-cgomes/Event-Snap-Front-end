
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PublicUploadPage from './pages/PublicUploadPage';
import Header from './components/Header';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isPublicEventPage = location.pathname.startsWith('/event/');
  
  const homePath = !user ? "/" : (user.userType === 'admin' || user.userType === 'global' ? '/admin-dashboard' : '/dashboard');

  const PrivateUserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!user) return <Navigate to="/login" />;
    if (user.userType === 'admin' || user.userType === 'global') return <Navigate to="/admin-dashboard" />;
    return <>{children}</>;
  };

  const PrivateAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!user) return <Navigate to="/login" />;
    if (user.userType === 'user') return <Navigate to="/dashboard" />;
    return <>{children}</>;
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {!isPublicEventPage && <Header />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={user ? <Navigate to={homePath} /> : <LandingPage />} />
          <Route path="/login" element={user ? <Navigate to={homePath} /> : <LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateUserRoute>
                <DashboardPage />
              </PrivateUserRoute>
            } 
          />
           <Route 
            path="/admin-dashboard" 
            element={
              <PrivateAdminRoute>
                <AdminDashboardPage />
              </PrivateAdminRoute>
            }
          />
          <Route path="/event/:eventId" element={<PublicUploadPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
