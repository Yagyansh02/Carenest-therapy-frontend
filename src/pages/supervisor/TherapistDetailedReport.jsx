import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Star, 
  TrendingUp,
  User,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2,
  Award,
  CheckCircle,
  Clock
} from 'lucide-react';
import { therapistService } from '../../api/therapist';
import { sessionService } from '../../api/session';
import { feedbackService } from '../../api/feedback';
import { supervisorService } from '../../api/supervisor';

export const TherapistDetailedReport = () => {
  const { therapistId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [therapist, setTherapist] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [feedbackData, setFeedbackData] = useState({});
  const [expandedSession, setExpandedSession] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState({});
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    averageRating: 0,
    totalFeedbacks: 0
  });

  useEffect(() => {
    fetchTherapistData();
  }, [therapistId]);

  const fetchTherapistData = async () => {
    try {
      setLoading(true);

      // Fetch therapist profile
      const therapistResponse = await therapistService.getTherapistById(therapistId);
      const therapistData = therapistResponse.data.data;
      setTherapist(therapistData);

      const therapistUserId = therapistData.userId?._id || therapistData.userId;

      // Fetch student sessions with feedback
      const sessionsResponse = await supervisorService.getStudentSessions(therapistUserId, 1, 100);
      const sessionsWithFeedback = sessionsResponse.data.data.sessions || [];

      setSessions(sessionsWithFeedback);

      // Pre-populate feedback data state from the sessions
      const initialFeedbackData = {};
      let totalFeedbacksCount = 0;

      sessionsWithFeedback.forEach(session => {
        initialFeedbackData[session._id] = {
          patientToTherapist: session.patientFeedback || null,
          therapistToPatient: session.therapistFeedback || null,
          supervisorToTherapist: null 
        };
        if (session.patientFeedback) totalFeedbacksCount++;
        if (session.therapistFeedback) totalFeedbacksCount++;
      });

      setFeedbackData(initialFeedbackData);

      // Calculate stats
      const completed = sessionsWithFeedback.filter(s => s.status === 'completed').length;
      setStats({
        totalSessions: sessionsWithFeedback.length,
        completedSessions: completed,
        averageRating: therapistData.averageRating || 0,
        totalFeedbacks: totalFeedbacksCount
      });

    } catch (error) {
      console.error('Error fetching therapist data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSession = (sessionId) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
    } else {
      setExpandedSession(sessionId);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#748DAE] mx-auto mb-4" />
          <p className="text-gray-600">Loading therapist report...</p>
        </div>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Therapist not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/supervisor/reports')}
            className="flex items-center gap-2 text-[#748DAE] hover:text-[#657B9D] mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Therapists List
          </button>
          
          {/* Therapist Info Card */}
          <div className="bg-gradient-to-r from-[#748DAE] to-[#9ECAD6] rounded-xl shadow-lg p-6 text-white mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <User className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-1">
                    {therapist.userId?.fullName || 'Unknown'}
                  </h1>
                  <p className="text-white/90 mb-2">{therapist.userId?.email}</p>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      therapist.verificationStatus === 'verified' 
                        ? 'bg-green-500/30 backdrop-blur-sm' 
                        : 'bg-yellow-500/30 backdrop-blur-sm'
                    }`}>
                      {therapist.verificationStatus}
                    </span>
                    {therapist.isStudent && (
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-500/30 backdrop-blur-sm">
                        Student Therapist
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedSessions}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Award className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)} ⭐</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Experience</p>
                <p className="text-2xl font-bold text-gray-900">{therapist.yearsOfExperience || 0} yrs</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sessions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Reports</h2>
          
          {sessions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Sessions Found
              </h3>
              <p className="text-gray-600">
                This therapist hasn't conducted any sessions yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Session Header */}
                  <button
                    onClick={() => toggleSession(session._id)}
                    className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 bg-gradient-to-br from-[#9ECAD6] to-[#748DAE] rounded-lg">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-3">
                          <p className="font-semibold text-gray-900">
                            {formatDate(session.scheduledAt)}
                          </p>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            session.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : session.status === 'confirmed'
                              ? 'bg-blue-100 text-blue-800'
                              : session.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Patient: {session.patientId?.fullName || 'Unknown'} • {formatTime(session.scheduledAt)}
                        </p>
                      </div>
                    </div>
                    {expandedSession === session._id ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>

                  {/* Expanded Session Details */}
                  <AnimatePresence>
                    {expandedSession === session._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-100"
                      >
                        {loadingFeedback[session._id] ? (
                          <div className="p-8 text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-[#748DAE] mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Loading feedback...</p>
                          </div>
                        ) : (
                          <div className="p-6 bg-gray-50 space-y-4">
                            {/* Patient Feedback */}
                            {feedbackData[session._id]?.patientToTherapist && (
                              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <h4 className="font-semibold text-blue-900 text-sm mb-3 flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4" />
                                  Patient Feedback
                                </h4>
                                <div className="flex items-center gap-2 mb-3">
                                  {renderStars(feedbackData[session._id].patientToTherapist.overallRating)}
                                  <span className="text-sm font-semibold text-gray-700">
                                    {feedbackData[session._id].patientToTherapist.overallRating}/5
                                  </span>
                                </div>
                                {feedbackData[session._id].patientToTherapist.comment && (
                                  <p className="text-sm text-gray-700 mb-3">
                                    {feedbackData[session._id].patientToTherapist.comment}
                                  </p>
                                )}
                                {/* Category Ratings */}
                                {feedbackData[session._id].patientToTherapist.categoryRatings && 
                                 Object.keys(feedbackData[session._id].patientToTherapist.categoryRatings).length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-blue-200">
                                    <p className="text-xs font-semibold text-blue-800 mb-2">Detailed Ratings:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                      {Object.entries(feedbackData[session._id].patientToTherapist.categoryRatings)
                                        .filter(([_, value]) => value !== null)
                                        .map(([key, value]) => (
                                          <div key={key} className="text-xs text-gray-600">
                                            <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                                            <span className="ml-1 font-semibold text-blue-700">{value}/5</span>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Therapist Notes */}
                            {feedbackData[session._id]?.therapistToPatient && (
                              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                                <h4 className="font-semibold text-green-900 text-sm mb-3 flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4" />
                                  Therapist's Notes to Patient
                                </h4>
                                {feedbackData[session._id].therapistToPatient.overallRating && (
                                  <div className="flex items-center gap-2 mb-3">
                                    {renderStars(feedbackData[session._id].therapistToPatient.overallRating)}
                                    <span className="text-sm font-semibold text-gray-700">
                                      Session Effectiveness: {feedbackData[session._id].therapistToPatient.overallRating}/5
                                    </span>
                                  </div>
                                )}
                                {feedbackData[session._id].therapistToPatient.recommendations && (
                                  <div className="mb-3">
                                    <p className="text-xs font-semibold text-green-800 mb-1">Recommendations:</p>
                                    <p className="text-sm text-gray-700">
                                      {feedbackData[session._id].therapistToPatient.recommendations}
                                    </p>
                                  </div>
                                )}
                                {feedbackData[session._id].therapistToPatient.comment && (
                                  <div>
                                    <p className="text-xs font-semibold text-green-800 mb-1">Progress Notes:</p>
                                    <p className="text-sm text-gray-700">
                                      {feedbackData[session._id].therapistToPatient.comment}
                                    </p>
                                  </div>
                                )}
                                {/* Category Ratings for therapist feedback */}
                                {feedbackData[session._id].therapistToPatient.categoryRatings && 
                                 Object.keys(feedbackData[session._id].therapistToPatient.categoryRatings).length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-green-200">
                                    <p className="text-xs font-semibold text-green-800 mb-2">Session Metrics:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                      {Object.entries(feedbackData[session._id].therapistToPatient.categoryRatings)
                                        .filter(([_, value]) => value !== null && value !== undefined)
                                        .map(([key, value]) => (
                                          <div key={key} className="text-xs text-gray-600">
                                            <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                                            <span className="ml-1 font-semibold text-green-700">{value}/5</span>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Supervisor Feedback */}
                            {feedbackData[session._id]?.supervisorToTherapist && (
                              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                                <h4 className="font-semibold text-purple-900 text-sm mb-3 flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4" />
                                  Your Feedback to Therapist
                                </h4>
                                <div className="flex items-center gap-2 mb-3">
                                  {renderStars(feedbackData[session._id].supervisorToTherapist.overallRating)}
                                  <span className="text-sm font-semibold text-gray-700">
                                    {feedbackData[session._id].supervisorToTherapist.overallRating}/5
                                  </span>
                                </div>
                                {feedbackData[session._id].supervisorToTherapist.comment && (
                                  <p className="text-sm text-gray-700">
                                    {feedbackData[session._id].supervisorToTherapist.comment}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* No Feedback */}
                            {!feedbackData[session._id]?.patientToTherapist && 
                             !feedbackData[session._id]?.therapistToPatient && 
                             !feedbackData[session._id]?.supervisorToTherapist && (
                              <div className="text-center py-6">
                                <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">
                                  No feedback available for this session yet
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

