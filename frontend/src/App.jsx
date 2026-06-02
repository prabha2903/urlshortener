import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layouts
import AuthLayout    from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages (lazy loaded for performance)
const Login     = React.lazy(() => import('./pages/Login'));
const Signup    = React.lazy(() => import('./pages/Signup'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Analytics = React.lazy(() => import('./pages/Analytics'));

// Full-screen loading fallback while lazy components load
const PageLoader = () => (
  <div className="min-h-screen bg-dark-900 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center animate-pulse-slow">
        <span className="text-white font-display font-bold text-lg">L</span>
      </div>
      <p className="text-slate-500 text-sm font-body animate-pulse">Loading…</p>
    </div>
  </div>
);

// Protected route wrapper — redirects to /login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public route wrapper — redirects to /dashboard if already authenticated
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public auth routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthLayout>
                <Login />
              </AuthLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <AuthLayout>
                <Signup />
              </AuthLayout>
            </PublicRoute>
          }
        />

        {/* Protected dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Analytics />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* 404 fallback */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
              <div className="text-center">
                <p className="text-8xl font-display font-bold text-gradient mb-4">404</p>
                <p className="text-slate-400 font-body mb-6">Page not found</p>
                <a href="/dashboard" className="btn-brand">Go Home</a>
              </div>
            </div>
          }
        />
      </Routes>
    </Suspense>
  );
}