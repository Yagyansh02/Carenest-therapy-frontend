import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { sessionService } from '../../api/session';
import { feedbackService } from '../../api/feedback';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Calendar, 
  MessageSquare, 
  User,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PatientFeedbackHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [therapistSessions, setTherapistSessions] = useState([]);
  const [expandedTherapist, setExpandedTherapist] = useState(null);
  const [feedbackData, setFeedbackData] = useState({});
  const [loadingFeedback, setLoadingFeedback] = useState({});

  useEffect(() => {
    fetchSessionsAndOrganizeByTherapist();
  }, []);

  const fetchSessionsAndOrganizeByTherapist = async () => {
    try {
      setLoading(true);
      const response = await sessionService.getMyPatientSessions();
      const sessions = response.data.data.sessions || [];

      // Filter only completed sessions
      const completedSessions = sessions.filter(s => s.status === 'completed');

      // Group sessions by therapist
      const therapistMap = {};
      completedSessions.forEach(session => {
        const therapistId = session.therapistId._id;
        if (!therapistMap[therapistId]) {
          therapistMap[therapistId] = {
            therapist: session.therapistId,
            sessions: []
          };
        }
        therapistMap[therapistId].sessions.push(session);
      });

      // Convert to array and sort by most recent session
      const therapistArray = Object.values(therapistMap).map(item => ({
        ...item,
        sessions: item.sessions.sort((a, b) => 
          new Date(b.scheduledAt) - new Date(a.scheduledAt)
        )
      }));

      setTherapistSessions(therapistArray);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbackForTherapist = async (therapistId) => {
    if (feedbackData[therapistId]) {
      // Already loaded
      return;
    }

    try {
      setLoadingFeedback(prev => ({ ...prev, [therapistId]: true }));

      // Get all feedback related to this therapist
      const response = await feedbackService.getAllFeedbacks({
        page: 1,
        limit: 100
      });

      const allFeedbacks = response.data.data.feedbacks || [];

      // Filter feedback for sessions with this therapist
      const therapistData = therapistSessions.find(t => t.therapist._id === therapistId);
      const sessionIds = therapistData.sessions.map(s => s._id);

      const relevantFeedback = allFeedbacks.filter(f => 
        sessionIds.includes(f.sessionId?._id)
      );

      // Organize feedback by session
      const feedbackBySession = {};
      relevantFeedback.forEach(feedback => {
        const sessionId = feedback.sessionId._id;
        if (!feedbackBySession[sessionId]) {
          feedbackBySession[sessionId] = {
            given: null,
            received: null
          };
        }

        if (feedback.fromUser._id === user._id) {
          feedbackBySession[sessionId].given = feedback;
        } else {
          feedbackBySession[sessionId].received = feedback;
        }
      });

      console.log('Feedback organized by session:', feedbackBySession);

      setFeedbackData(prev => ({
        ...prev,
        [therapistId]: feedbackBySession
      }));
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoadingFeedback(prev => ({ ...prev, [therapistId]: false }));
    }
  };

  const toggleTherapist = async (therapistId) => {
    if (expandedTherapist === therapistId) {
      setExpandedTherapist(null);
    } else {
      setExpandedTherapist(therapistId);
      await fetchFeedbackForTherapist(therapistId);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#748DAE] mx-auto mb-4" />
          <p className="text-gray-600">Loading your feedback history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[#748DAE] hover:text-[#657B9D] mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Feedback History
          </h1>
          <p className="text-gray-600">
            View all feedback exchanged with your therapists, organized by session
          </p>
        </motion.div>

        {/* Therapist Cards */}
        {therapistSessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100"
          >
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Completed Sessions Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Once you complete sessions with therapists, you'll be able to view feedback history here.
            </p>
            <button
              onClick={() => navigate('/therapists')}
              className="px-6 py-3 bg-[#748DAE] hover:bg-[#657B9D] text-white rounded-lg transition-colors"
            >
              Find a Therapist
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {therapistSessions.map((item, index) => (
              <motion.div
                key={item.therapist._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Therapist Header */}
                <button
                  onClick={() => toggleTherapist(item.therapist._id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#9ECAD6] to-[#748DAE] rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {item.therapist.fullName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.sessions.length} completed session{item.sessions.length !== 1 ? 's' : ''}
                      </p>
                      {item.therapist.therapistProfile?.specializations?.[0] && (
                        <p className="text-xs text-[#748DAE] mt-1">
                          {item.therapist.therapistProfile.specializations[0]}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {expandedTherapist === item.therapist._id ? (
                      <ChevronUp className="h-6 w-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Sessions */}
                <AnimatePresence>
                  {expandedTherapist === item.therapist._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-100"
                    >
                      {loadingFeedback[item.therapist._id] ? (
                        <div className="p-8 text-center">
                          <Loader2 className="h-8 w-8 animate-spin text-[#748DAE] mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Loading feedback...</p>
                        </div>
                      ) : (
                        <div className="p-6 bg-gray-50 space-y-4">
                          {item.sessions.map((session) => {
                            const sessionFeedback = feedbackData[item.therapist._id]?.[session._id];
                            const hasAnyFeedback = sessionFeedback?.given || sessionFeedback?.received;

                            return (
                              <div
                                key={session._id}
                                className="bg-white rounded-lg p-5 border border-gray-200"
                              >
                                {/* Session Info */}
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-[#748DAE]" />
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        Session on {formatDate(session.scheduledAt)}
                                      </p>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {new Date(session.scheduledAt).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Feedback Section */}
                                {hasAnyFeedback ? (
                                  <div className="space-y-4">
                                    {/* Feedback You Gave */}
                                    {sessionFeedback.given && (
                                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                        <div className="flex items-start justify-between mb-3">
                                          <h4 className="font-semibold text-blue-900 text-sm">
                                            Your Feedback to Therapist
                                          </h4>
                                          {sessionFeedback.given.overallRating && (
                                            <div className="flex items-center gap-2">
                                              {renderStars(sessionFeedback.given.overallRating)}
                                              <span className="text-sm font-semibold text-gray-700">
                                                {sessionFeedback.given.overallRating}/5
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                        <div className="mb-3">
                                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                            {sessionFeedback.given.comment || 'No feedback text provided.'}
                                          </p>
                                        </div>
                                        {/* Category Ratings */}
                                        {sessionFeedback.given.categoryRatings && Object.keys(sessionFeedback.given.categoryRatings).length > 0 && (
                                          <div className="mt-3 pt-3 border-t border-blue-200">
                                            <p className="text-xs font-semibold text-blue-800 mb-2">Detailed Ratings:</p>
                                            <div className="grid grid-cols-2 gap-2">
                                              {Object.entries(sessionFeedback.given.categoryRatings)
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
                                        <p className="text-xs text-gray-500 mt-3">
                                          Given on {formatDate(sessionFeedback.given.createdAt)}
                                        </p>
                                      </div>
                                    )}

                                    {/* Feedback You Received */}
                                    {sessionFeedback.received && (
                                      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                                        <h4 className="font-semibold text-green-900 text-sm mb-3">
                                          Therapist's Progress Notes
                                        </h4>
                                        {sessionFeedback.received.recommendations && (
                                          <div className="mb-3">
                                            <p className="text-xs font-semibold text-green-800 mb-1">Recommendations:</p>
                                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                              {sessionFeedback.received.recommendations}
                                            </p>
                                          </div>
                                        )}
                                        {sessionFeedback.received.comment && (
                                          <div className="mb-3">
                                            <p className="text-xs font-semibold text-green-800 mb-1">Comments:</p>
                                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                              {sessionFeedback.received.comment}
                                            </p>
                                          </div>
                                        )}
                                        {/* Category Ratings from Therapist */}
                                        {sessionFeedback.received.categoryRatings && Object.keys(sessionFeedback.received.categoryRatings).length > 0 && (
                                          <div className="mt-3 pt-3 border-t border-green-200">
                                            <p className="text-xs font-semibold text-green-800 mb-2">Progress Ratings:</p>
                                            <div className="grid grid-cols-2 gap-2">
                                              {Object.entries(sessionFeedback.received.categoryRatings)
                                                .filter(([_, value]) => value !== null)
                                                .map(([key, value]) => (
                                                  <div key={key} className="text-xs text-gray-600">
                                                    <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                                                    <span className="ml-1 font-semibold text-green-700">{value}/5</span>
                                                  </div>
                                                ))}
                                            </div>
                                          </div>
                                        )}
                                        {(!sessionFeedback.received.recommendations && !sessionFeedback.received.comment) && (
                                          <p className="text-sm text-gray-500 italic">No progress notes provided.</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-3">
                                          Received on {formatDate(sessionFeedback.received.createdAt)}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-center py-6">
                                    <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">
                                      No feedback exchanged for this session yet
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
