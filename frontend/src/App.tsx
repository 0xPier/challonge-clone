import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from './hooks/redux';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TournamentListPage from './pages/TournamentListPage';
import TournamentDetailPage from './pages/TournamentDetailPage';
import CreateTournamentPage from './pages/CreateTournamentPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';

// Store
import { loadUser, logout } from './store/slices/authSlice';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Load user if token exists
    const token = localStorage.getItem('token');
    if (token && !user) {
      dispatch(loadUser());
    }
  }, [dispatch, user]);

  // Handle logout on token expiry or manual logout
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      if (!token && isAuthenticated) {
        dispatch(logout());
        toast.error('Session expired. Please login again.');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAuthenticated, dispatch]);

  const MainLayout = () => (
    <Layout>
      <Outlet />
    </Layout>
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100">
      <Routes>
        {/* Routes with main layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tournaments" element={<TournamentListPage />} />
          <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-tournament"
            element={
              <ProtectedRoute>
                <CreateTournamentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Standalone routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
