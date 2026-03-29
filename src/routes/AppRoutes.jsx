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
import { CollegeProfileSetup } from '../pages/college/CollegeProfileSetup';
import { ManageStudents } from '../pages/college/ManageStudents';
import { VideoCallPage } from '../pages/VideoCall/VideoCallPage';
import { ChatPage } from '../pages/chat/ChatPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Full-screen video call — rendered outside Layout so there is no navbar */}
      <Route
        path="/video-call/:sessionId"
        element={
          <ProtectedRoute>
            <VideoCallPage />
          </ProtectedRoute>
        }
      />

      {/* Full-screen chat — rendered outside Layout for immersive experience */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:roomId"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/new/:recipientId"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />

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
            <ProtectedRoute allowedRoles={['therapist']}>
              <TherapistProfileSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/therapist/sessions"
          element={
            <ProtectedRoute allowedRoles={['therapist']}>
              <TherapistSessions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book/:therapistId"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <AssessmentForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment/recommendations"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <TherapistRecommendations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sessions"
          element={
            <ProtectedRoute allowedRoles={['patient', 'therapist', 'supervisor']}>
              <SessionsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/manage-therapists"
          element={
            <ProtectedRoute allowedRoles={['supervisor']}>
              <ManageTherapists />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/therapist/:id"
          element={
            <ProtectedRoute allowedRoles={['supervisor']}>
              <TherapistProfileView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/profile-setup"
          element={
            <ProtectedRoute allowedRoles={['supervisor']}>
              <SupervisorProfileSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/reports"
          element={
            <ProtectedRoute allowedRoles={['supervisor']}>
              <TherapistReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/therapist-report/:therapistId"
          element={
            <ProtectedRoute allowedRoles={['supervisor']}>
              <TherapistDetailedReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-feedback"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <MyFeedbackPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/give-feedback"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <GiveFeedbackPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback-history"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientFeedbackHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/college/profile-setup"
          element={
            <ProtectedRoute allowedRoles={['college']}>
              <CollegeProfileSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/college/manage-students"
          element={
            <ProtectedRoute allowedRoles={['college']}>
              <ManageStudents />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};