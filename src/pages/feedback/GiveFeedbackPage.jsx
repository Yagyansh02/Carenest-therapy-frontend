import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { feedbackService } from '../../api/feedback';
import { PatientToTherapistFeedback } from '../../components/feedback/PatientToTherapistFeedback';
import { TherapistToPatientFeedback } from '../../components/feedback/TherapistToPatientFeedback';
import { SupervisorToTherapistFeedback } from '../../components/feedback/SupervisorToTherapistFeedback';
import { Card } from '../../components/common/Card';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export const GiveFeedbackPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Get params from URL
  const feedbackType = searchParams.get('type');
  const recipientId = searchParams.get('recipientId');
  const sessionId = searchParams.get('sessionId');

  const handleSubmit = async (feedbackData) => {
    try {
      setLoading(true);
      await feedbackService.createFeedback(feedbackData);
      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/my-feedback');
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const renderFeedbackForm = () => {
    switch (feedbackType) {
      case 'patient-to-therapist':
        if (user.role !== 'patient') {
          return <div className="text-red-600">Unauthorized: Only patients can give therapist feedback</div>;
        }
        return (
          <PatientToTherapistFeedback
            sessionId={sessionId}
            therapistId={recipientId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        );

      case 'therapist-to-patient':
        if (user.role !== 'therapist') {
          return <div className="text-red-600">Unauthorized: Only therapists can give patient feedback</div>;
        }
        return (
          <TherapistToPatientFeedback
            sessionId={sessionId}
            patientId={recipientId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        );

      case 'supervisor-to-therapist':
        if (user.role !== 'supervisor') {
          return <div className="text-red-600">Unauthorized: Only supervisors can give therapist reviews</div>;
        }
        return (
          <SupervisorToTherapistFeedback
            therapistId={recipientId}
            sessionId={sessionId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        );

      default:
        return <div className="text-red-600">Invalid feedback type</div>;
    }
  };

  const getTitleByType = () => {
    switch (feedbackType) {
      case 'patient-to-therapist':
        return 'Rate Your Session';
      case 'therapist-to-patient':
        return 'Patient Progress Notes';
      case 'supervisor-to-therapist':
        return 'Therapist Performance Review';
      default:
        return 'Give Feedback';
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="bg-white rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">
            Feedback Submitted!
          </h2>
          <p className="text-secondary-600">
            Thank you for your feedback. Redirecting...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleCancel}
          className="flex items-center gap-2 text-secondary-600 hover:text-secondary-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            {getTitleByType()}
          </h1>
          <p className="text-secondary-600">
            Share your feedback to help improve the care experience
          </p>
        </motion.div>

        {/* Feedback Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8">
            {renderFeedbackForm()}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
