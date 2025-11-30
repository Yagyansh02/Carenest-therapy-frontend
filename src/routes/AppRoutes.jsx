import { Routes, Route } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from './ProtectedRoute';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { TherapistList } from '../pages/therapist/TherapistList';
import { TherapistDetail } from '../pages/therapist/TherapistDetail';
import { TherapistProfileSetup } from '../pages/therapist/TherapistProfileSetup';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { Profile } from '../pages/user/Profile';
import { BookingPage } from '../pages/booking/BookingPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/therapists" element={<TherapistList />} />
        <Route path="/therapists/:id" element={<TherapistDetail />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/therapist/setup-profile"
          element={
            <ProtectedRoute>
              <TherapistProfileSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book/:therapistId"
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};