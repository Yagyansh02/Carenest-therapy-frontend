import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { sessionService } from '../../api/session';
import { feedbackService } from '../../api/feedback';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const SessionsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past
  const [error, setError] = useState('');
  const [cancellingSession, setCancellingSession] = useState(null);
  const [sessionFeedbacks, setSessionFeedbacks] = useState({}); // Track which sessions have feedback

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await sessionService.getMyPatientSessions();
      const sessionData = response.data.data.sessions || [];
      setSessions(sessionData);

      // Check which completed sessions have feedback
      const completedSessions = sessionData.filter(s => s.status === 'completed');
      const feedbackChecks = {};
      
      await Promise.all(completedSessions.map(async (session) => {
        try {
          const feedbackResponse = await feedbackService.getAllFeedbacks({
            sessionId: session._id,
            feedbackType: 'patient-to-therapist'
          });
          feedbackChecks[session._id] = feedbackResponse.data.data.feedbacks.length > 0;
        } catch (err) {
          feedbackChecks[session._id] = false;
        }
      }));
      
      setSessionFeedbacks(feedbackChecks);
    } catch (err) {
      setError('Failed to load sessions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to cancel this session?')) {
      return;
    }

    const reason = prompt('Please provide a cancellation reason:');
    if (!reason) return;

    try {
      setCancellingSession(sessionId);
      await sessionService.cancelSession(sessionId, reason);
      
      // Update local state
      setSessions(sessions.map(s => 
        s._id === sessionId 
          ? { ...s, status: 'cancelled', cancellationReason: reason }
          : s
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel session');
      console.error(err);
    } finally {
      setCancellingSession(null);
    }
  };

  const getFilteredSessions = () => {
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return sessions.filter(s => 
          new Date(s.scheduledAt) >= now && ['pending', 'confirmed', 'scheduled'].includes(s.status)
        );
      case 'past':
        return sessions.filter(s => 
          new Date(s.scheduledAt) < now || ['completed', 'cancelled', 'rejected', 'no-show'].includes(s.status)
        );
      default:
        return sessions;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending':
        return 'Waiting for therapist approval...';
      case 'confirmed':
        return 'Session confirmed! Meeting link available.';
      case 'scheduled':
        return 'Session scheduled';
      case 'completed':
        return 'Session completed';
      case 'cancelled':
        return 'Session cancelled';
      case 'rejected':
        return 'Session request rejected by therapist';
      case 'no-show':
        return 'Missed session';
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const canJoinSession = (session) => {
    const sessionTime = new Date(session.scheduledAt);
    const now = new Date();
    const fifteenMinutesBefore = new Date(sessionTime.getTime() - 15 * 60000);
    
    return (session.status === 'confirmed' || session.status === 'scheduled')
      && now >= fifteenMinutesBefore 
      && now <= sessionTime
      && session.meetingLink;
  };

  const canCancelSession = (session) => {
    const sessionTime = new Date(session.scheduledAt);
    const now = new Date();
    const twentyFourHoursBefore = new Date(sessionTime.getTime() - 24 * 60 * 60000);
    
    return (session.status === 'pending' || session.status === 'confirmed' || session.status === 'scheduled') 
      && now < twentyFourHoursBefore;
  };

  const filteredSessions = getFilteredSessions();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900">My Sessions</h1>
          <p className="text-secondary-600 mt-2">View and manage your therapy sessions</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-secondary-600 hover:bg-secondary-50'
            }`}
          >
            All Sessions ({sessions.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'upcoming'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-secondary-600 hover:bg-secondary-50'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'past'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-secondary-600 hover:bg-secondary-50'
            }`}
          >
            Past
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Sessions List */}
        {filteredSessions.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-secondary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">No Sessions Found</h3>
            <p className="text-secondary-600 mb-6">
              {filter === 'all' 
                ? "You haven't booked any sessions yet." 
                : `No ${filter} sessions found.`}
            </p>
            <Button onClick={() => navigate('/therapists')}>
              Find a Therapist
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map(session => (
              <Card key={session._id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Session Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Therapist Avatar */}
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-primary-700">
                          {session.therapistId?.fullName?.charAt(0) || 'T'}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-secondary-900">
                          {session.therapistId?.fullName || 'Therapist'}
                        </h3>
                        
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-secondary-600 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(session.scheduledAt).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                          
                          <p className="text-sm text-secondary-600 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(session.scheduledAt).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })} ({session.duration} minutes)
                          </p>

                          <p className="text-sm text-secondary-600 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            {session.sessionType || 'video'}
                          </p>
                        </div>

                        {/* Status Badges */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                            {session.status.toUpperCase()}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(session.paymentStatus)}`}>
                            {session.paymentStatus === 'paid' && session.sessionFee === 0 
                              ? 'FREE TRIAL' 
                              : session.paymentStatus.toUpperCase()}
                          </span>
                          {session.sessionFee > 0 && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                              ₹{session.sessionFee}
                            </span>
                          )}
                        </div>

                        {/* Status Message */}
                        {(session.status === 'pending' || session.status === 'confirmed' || session.status === 'rejected') && (
                          <div className={`mt-3 p-3 rounded-lg ${
                            session.status === 'pending' ? 'bg-yellow-50' :
                            session.status === 'confirmed' ? 'bg-blue-50' :
                            'bg-red-50'
                          }`}>
                            <p className={`text-sm font-medium ${
                              session.status === 'pending' ? 'text-yellow-900' :
                              session.status === 'confirmed' ? 'text-blue-900' :
                              'text-red-900'
                            }`}>
                              {getStatusMessage(session.status)}
                            </p>
                          </div>
                        )}

                        {/* Therapist Notes */}
                        {session.therapistNotes && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-900 mb-1">Therapist Notes:</p>
                            <p className="text-sm text-blue-700">{session.therapistNotes}</p>
                          </div>
                        )}

                        {/* Cancellation/Rejection Info */}
                        {(session.status === 'cancelled' || session.status === 'rejected') && session.cancellationReason && (
                          <div className="mt-3 p-3 bg-red-50 rounded-lg">
                            <p className="text-sm font-medium text-red-900 mb-1">
                              {session.status === 'rejected' ? 'Rejection Reason:' : 'Cancellation Reason:'}
                            </p>
                            <p className="text-sm text-red-700">{session.cancellationReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 md:w-48">
                    {canJoinSession(session) && (
                      <Button
                        onClick={() => window.open(session.meetingLink, '_blank')}
                        size="sm"
                        className="w-full"
                      >
                        Join Session
                      </Button>
                    )}

                    {session.meetingLink && (session.status === 'confirmed' || session.status === 'scheduled') && !canJoinSession(session) && (
                      <Button
                        onClick={() => window.open(session.meetingLink, '_blank')}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        View Meeting Link
                      </Button>
                    )}

                    {canCancelSession(session) && (
                      <button
                        onClick={() => handleCancelSession(session._id)}
                        disabled={cancellingSession === session._id}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      >
                        {cancellingSession === session._id ? 'Cancelling...' : 'Cancel Session'}
                      </button>
                    )}

                    {session.status === 'completed' && !sessionFeedbacks[session._id] && (
                      <button
                        onClick={() => navigate(
                          `/give-feedback?type=patient-to-therapist&sessionId=${session._id}&recipientId=${session.therapistId._id}`
                        )}
                        className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition"
                      >
                        Give Feedback
                      </button>
                    )}
                    
                    {session.status === 'completed' && sessionFeedbacks[session._id] && (
                      <span className="px-4 py-2 text-sm font-medium text-green-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Feedback Given
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Book New Session Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => navigate('/therapists')}
            size="lg"
          >
            Book Another Session
          </Button>
        </div>
      </div>
    </div>
  );
};
