import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionService } from '../../api/session';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PatientAssessmentModal } from '../../components/therapist/PatientAssessmentModal';

export const TherapistSessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, upcoming, past
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [meetingLinkModal, setMeetingLinkModal] = useState({ show: false, sessionId: null, meetingLink: '' });
  const [assessmentModal, setAssessmentModal] = useState({ show: false, patientId: null, patientName: '' });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await sessionService.getMyTherapistSessions();
      setSessions(response.data.data.sessions || []);
    } catch (err) {
      setError('Failed to load sessions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSession = (sessionId) => {
    setMeetingLinkModal({ show: true, sessionId, meetingLink: '' });
  };

  const confirmAcceptSession = async () => {
    const { sessionId, meetingLink } = meetingLinkModal;
    
    if (!meetingLink.trim()) {
      alert('Please provide a meeting link');
      return;
    }

    try {
      setActionLoading(sessionId);
      await sessionService.acceptSession(sessionId, meetingLink.trim());
      
      // Update local state
      setSessions(sessions.map(s => 
        s._id === sessionId 
          ? { ...s, status: 'confirmed', meetingLink: meetingLink.trim() }
          : s
      ));
      
      setMeetingLinkModal({ show: false, sessionId: null, meetingLink: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept session');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSession = async (sessionId) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    if (reason === null) return; // User cancelled

    try {
      setActionLoading(sessionId);
      await sessionService.rejectSession(sessionId, reason);
      
      // Update local state
      setSessions(sessions.map(s => 
        s._id === sessionId 
          ? { ...s, status: 'rejected', cancellationReason: reason || 'Therapist rejected the request' }
          : s
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject session');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteSession = async (sessionId) => {
    if (!window.confirm('Mark this session as completed?')) return;

    try {
      setActionLoading(sessionId);
      await sessionService.completeSession(sessionId);
      
      // Update local state
      setSessions(sessions.map(s => 
        s._id === sessionId 
          ? { ...s, status: 'completed' }
          : s
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete session');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkNoShow = async (sessionId) => {
    if (!window.confirm('Mark this session as no-show?')) return;

    try {
      setActionLoading(sessionId);
      await sessionService.markNoShow(sessionId);
      
      // Update local state
      setSessions(sessions.map(s => 
        s._id === sessionId 
          ? { ...s, status: 'no-show' }
          : s
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark no-show');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddNotes = async (sessionId) => {
    const notes = prompt('Enter session notes:');
    if (!notes) return;

    try {
      setActionLoading(sessionId);
      await sessionService.addTherapistNotes(sessionId, notes);
      
      // Update local state
      setSessions(sessions.map(s => 
        s._id === sessionId 
          ? { ...s, therapistNotes: notes }
          : s
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add notes');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const getFilteredSessions = () => {
    const now = new Date();
    
    switch (filter) {
      case 'pending':
        return sessions.filter(s => s.status === 'pending');
      case 'upcoming':
        return sessions.filter(s => 
          new Date(s.scheduledAt) >= now && s.status === 'confirmed'
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
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
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

  const canTakeAction = (session) => {
    const sessionTime = new Date(session.scheduledAt);
    const now = new Date();
    return (session.status === 'confirmed' || session.status === 'scheduled') && sessionTime <= now;
  };

  const filteredSessions = getFilteredSessions();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900">My Sessions</h1>
          <p className="text-secondary-600 mt-2">Manage your therapy sessions and appointments</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap">
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
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'pending'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-secondary-600 hover:bg-secondary-50'
            }`}
          >
            Pending Approval ({sessions.filter(s => s.status === 'pending').length})
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
            <p className="text-secondary-600">
              {filter === 'all' 
                ? "You don't have any sessions yet." 
                : `No ${filter} sessions found.`}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map(session => (
              <Card key={session._id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Session Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Patient Avatar */}
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-primary-700">
                          {session.patientId?.fullName?.charAt(0) || 'P'}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-secondary-900">
                          {session.patientId?.fullName || 'Patient'}
                        </h3>
                        <p className="text-sm text-secondary-600">{session.patientId?.email}</p>
                        
                        <div className="mt-3 space-y-1">
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

                        {/* Therapist Notes */}
                        {session.therapistNotes && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-900 mb-1">Session Notes:</p>
                            <p className="text-sm text-blue-700">{session.therapistNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:w-56">
                    {/* View Patient Assessment - Only for confirmed/scheduled sessions */}
                    {(session.status === 'confirmed' || session.status === 'scheduled' || session.status === 'completed') && (
                      <button
                        onClick={() => setAssessmentModal({
                          show: true,
                          patientId: session.patientId._id,
                          patientName: session.patientId.fullName
                        })}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Assessment
                      </button>
                    )}

                    {/* Accept/Reject Pending Session */}
                    {session.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleAcceptSession(session._id)}
                          disabled={actionLoading === session._id}
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {actionLoading === session._id ? 'Processing...' : 'Accept Session'}
                        </Button>
                        <button
                          onClick={() => handleRejectSession(session._id)}
                          disabled={actionLoading === session._id}
                          className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}



                    {/* Complete Session */}
                    {canTakeAction(session) && (
                      <Button
                        onClick={() => handleCompleteSession(session._id)}
                        disabled={actionLoading === session._id}
                        size="sm"
                        className="w-full"
                      >
                        Mark Complete
                      </Button>
                    )}

                    {/* Mark No-Show */}
                    {canTakeAction(session) && (
                      <button
                        onClick={() => handleMarkNoShow(session._id)}
                        disabled={actionLoading === session._id}
                        className="px-4 py-2 text-sm font-medium text-yellow-600 hover:bg-yellow-50 rounded-lg transition disabled:opacity-50"
                      >
                        Mark No-Show
                      </button>
                    )}

                    {/* Add Notes */}
                    {session.status === 'scheduled' && (
                      <button
                        onClick={() => handleAddNotes(session._id)}
                        disabled={actionLoading === session._id}
                        className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition disabled:opacity-50"
                      >
                        {session.therapistNotes ? 'Update Notes' : 'Add Notes'}
                      </button>
                    )}

                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Meeting Link Modal */}
      {meetingLinkModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Accept Session & Provide Meeting Link
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a meeting link (Google Meet, Zoom, etc.) for the session.
            </p>
            <input
              type="url"
              value={meetingLinkModal.meetingLink}
              onChange={(e) =>
                setMeetingLinkModal({ ...meetingLinkModal, meetingLink: e.target.value })
              }
              placeholder="https://meet.google.com/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={confirmAcceptSession}
                disabled={actionLoading === meetingLinkModal.sessionId}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {actionLoading === meetingLinkModal.sessionId ? 'Processing...' : 'Confirm & Accept'}
              </button>
              <button
                onClick={() => setMeetingLinkModal({ show: false, sessionId: null, meetingLink: '' })}
                disabled={actionLoading === meetingLinkModal.sessionId}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Assessment Modal */}
      <PatientAssessmentModal
        isOpen={assessmentModal.show}
        onClose={() => setAssessmentModal({ show: false, patientId: null, patientName: '' })}
        patientId={assessmentModal.patientId}
        patientName={assessmentModal.patientName}
      />
    </div>
  );
};
