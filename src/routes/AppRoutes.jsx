import { Routes, Route } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from './ProtectedRoute';
import { LandingPage } from '../pages/LandingPage';
import { AboutPage } from '../pages/AboutPage';
import { ContactPage } from '../pages/ContactPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { TherapistList } from '../pages/therapist/TherapistList';
import { TherapistDetail } from '../pages/therapist/TherapistDetail';
import { TherapistProfileSetup } from '../pages/therapist/TherapistProfileSetup';
import { TherapistSessions } from '../pages/therapist/TherapistSessions';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { Profile } from '../pages/user/Profile';
import { BookingPage } from '../pages/booking/BookingPage';
import { SessionsList } from '../pages/sessions/SessionsList';
import { AssessmentForm } from '../pages/assessment/AssessmentForm';
import { TherapistRecommendations } from '../pages/assessment/TherapistRecommendations';
import { PaymentPage } from '../pages/payment/PaymentPage';
import { ManageTherapists } from '../pages/supervisor/ManageTherapists';
import { TherapistProfileView } from '../pages/supervisor/TherapistProfileView';
import { SupervisorProfileSetup } from '../pages/supervisor/SupervisorProfileSetup';
import { MyFeedbackPage } from '../pages/feedback/MyFeedbackPage';
import { GiveFeedbackPage } from '../pages/feedback/GiveFeedbackPage';
import { PatientFeedbackHistory } from '../pages/feedback/PatientFeedbackHistory';
import { TherapistReports } from '../pages/supervisor/TherapistReports';
import { TherapistDetailedReport } from '../pages/supervisor/TherapistDetailedReport';
import { AdminDashboard } from '../pages/admin/AdminDashboard';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
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
          path="/therapist/sessions"
          element={
            <ProtectedRoute>
              <TherapistSessions />
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
        <Route
          path="/assessment"
          element={
            <ProtectedRoute>
              <AssessmentForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment/recommendations"
          element={
            <ProtectedRoute>
              <TherapistRecommendations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sessions"
          element={
            <ProtectedRoute>
              <SessionsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/manage-therapists"
          element={
            <ProtectedRoute>
              <ManageTherapists />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/therapist/:id"
          element={
            <ProtectedRoute>
              <TherapistProfileView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/profile-setup"
          element={
            <ProtectedRoute>
              <SupervisorProfileSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/reports"
          element={
            <ProtectedRoute>
              <TherapistReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/therapist-report/:therapistId"
          element={
            <ProtectedRoute>
              <TherapistDetailedReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-feedback"
          element={
            <ProtectedRoute>
              <MyFeedbackPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/give-feedback"
          element={
            <ProtectedRoute>
              <GiveFeedbackPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback-history"
          element={
            <ProtectedRoute>
              <PatientFeedbackHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};