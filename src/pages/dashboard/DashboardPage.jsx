import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Calendar, MessageSquare, Settings, FileText, Heart } from 'lucide-react';
import { TherapistDashboardContent } from '../../components/dashboard/TherapistDashboardContent';
import { useState, useEffect, useCallback } from 'react';
import { sessionService } from '../../api/session';
import { assessmentService } from '../../api/assessment';
import { supervisorService } from '../../api/supervisor';
import { therapistService } from '../../api/therapist';
import api from '../../api/axios';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const getDashboardContent = () => {
    switch (user?.role) {
      case 'patient':
        return <PatientDashboard user={user} navigate={navigate} />;
      case 'therapist':
        return <TherapistDashboardContent user={user} />;
      case 'supervisor':
        return <SupervisorDashboard user={user} navigate={navigate} />;
      case 'admin':
        // Will redirect via useEffect
        return null;
      default:
        return <DefaultDashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {user?.role !== 'therapist' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.fullName || user?.email}!
            </h1>
            <p className="text-gray-600">
              Role: <span className="text-[#748DAE] font-medium capitalize">{user?.role}</span>
            </p>
          </motion.div>
        )}

        {getDashboardContent()}
      </div>
    </div>
  );
};

const PatientDashboard = ({ user, navigate }) => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    messages: 0,
    assessments: 0,
    progress: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch sessions
      const sessionsResponse = await sessionService.getMyPatientSessions();
      const allSessions = sessionsResponse.data.data.sessions || [];
      setSessions(allSessions);

      // Fetch assessment
      let hasAssessment = false;
      try {
        const assessmentResponse = await assessmentService.getMyAssessment();
        if (assessmentResponse.data.data.assessment) {
          hasAssessment = true;
          setAssessments([assessmentResponse.data.data.assessment]);
        }
      } catch (err) {
        console.log('No assessment found');
        setAssessments([]);
      }

      // Calculate stats
      const now = new Date();
      const upcomingCount = allSessions.filter(s => 
        new Date(s.scheduledAt) >= now && 
        ['pending', 'confirmed', 'scheduled'].includes(s.status)
      ).length;

      const completedCount = allSessions.filter(s => 
        s.status === 'completed'
      ).length;

      const totalScheduledOrCompleted = allSessions.filter(s => 
        ['confirmed', 'completed', 'scheduled'].includes(s.status)
      ).length;

      const progressPercent = totalScheduledOrCompleted > 0 
        ? Math.round((completedCount / totalScheduledOrCompleted) * 100) 
        : 0;

      setStats({
        upcomingSessions: upcomingCount,
        messages: 0, // TODO: Implement messaging system
        assessments: hasAssessment ? 1 : 0,
        progress: progressPercent
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingSessions = sessions
    .filter(s => 
      new Date(s.scheduledAt) >= new Date() && 
      ['pending', 'confirmed', 'scheduled'].includes(s.status)
    )
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
    .slice(0, 3);

  const dashboardStats = [
    { label: 'Upcoming Sessions', value: loading ? '...' : stats.upcomingSessions.toString(), icon: Calendar, color: 'bg-[#9ECAD6]' },
    { label: 'Messages', value: loading ? '...' : stats.messages.toString(), icon: MessageSquare, color: 'bg-[#748DAE]' },
    { label: 'Assessments', value: loading ? '...' : stats.assessments.toString(), icon: FileText, color: 'bg-[#F5CBCB]' },
    { label: 'Progress', value: loading ? '...' : `${stats.progress}%`, icon: Heart, color: 'bg-[#9ECAD6]' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Sessions</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#748DAE] mx-auto"></div>
            </div>
          ) : upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div 
                  key={session._id}
                  onClick={() => navigate('/sessions')}
                  className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {session.therapistId?.fullName || 'Therapist'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(session.scheduledAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })} at {new Date(session.scheduledAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-[#748DAE] mt-2 font-medium">
                        {session.therapistId?.therapistProfile?.specializations?.[0] || 'Therapy Session'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      session.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      session.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No upcoming sessions</p>
              <button
                onClick={() => navigate('/therapists')}
                className="mt-4 text-[#748DAE] hover:text-[#657B9D] text-sm font-medium"
              >
                Book a session →
              </button>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/sessions')}
              className="w-full p-4 text-left bg-gradient-to-r from-[#9ECAD6] to-[#748DAE] hover:from-[#8BB9C5] hover:to-[#657B9D] text-white rounded-lg transition-all hover:shadow-md"
            >
              <p className="font-medium">View My Sessions</p>
              <p className="text-sm opacity-90 mt-1">Manage your appointments</p>
            </button>
            <button 
              onClick={() => navigate('/therapists')}
              className="w-full p-4 text-left bg-[#9ECAD6] hover:bg-[#8BB9C5] text-white rounded-lg transition-all hover:shadow-md"
            >
              <p className="font-medium">Book New Session</p>
              <p className="text-sm opacity-90 mt-1">Schedule with your therapist</p>
            </button>
            <button 
              onClick={() => navigate('/assessment')}
              className="w-full p-4 text-left bg-[#748DAE] hover:bg-[#657B9D] text-white rounded-lg transition-all hover:shadow-md"
            >
              <p className="font-medium">Take Assessment</p>
              <p className="text-sm opacity-90 mt-1">Complete wellness check-in</p>
            </button>
            <button 
              onClick={() => navigate('/feedback-history')}
              className="w-full p-4 text-left bg-[#F5CBCB] hover:bg-[#E4BABA] text-white rounded-lg transition-all hover:shadow-md"
            >
              <p className="font-medium">View Feedback History</p>
              <p className="text-sm opacity-90 mt-1">See all session feedback</p>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const SupervisorDashboard = ({ user, navigate }) => {
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [supervisorProfile, setSupervisorProfile] = useState(null);
  const [stats, setStats] = useState({
    therapists: 0,
    pendingReviews: 0
  });
  const [supervisedStudents, setSupervisedStudents] = useState([]);
  const [recentTherapists, setRecentTherapists] = useState([]);

    useEffect(() => {
      fetchSupervisorData();
    }, []);

    // Refresh data when navigating back from other pages
    useEffect(() => {
      const refreshOnFocus = () => {
        if (!document.hidden) {
          console.log('Page visible again, refreshing supervisor data...');
          fetchSupervisorData(true);
        }
      };

      window.addEventListener('focus', refreshOnFocus);
      document.addEventListener('visibilitychange', refreshOnFocus);

      return () => {
        window.removeEventListener('focus', refreshOnFocus);
        document.removeEventListener('visibilitychange', refreshOnFocus);
      };
    }, []);    const fetchSupervisorData = async (forceRefresh = false) => {
      if (forceRefresh) {
        console.log('Force refreshing supervisor data...');
      }
    try {
      setLoading(true);
      let currentProfileId = null;

      // Fetch supervisor profile to get supervised students - DO THIS FIRST
      try {
        const profileResponse = await supervisorService.getMyProfile();
        const profile = profileResponse.data.data;
        
        // Check if profile exists
        if (!profile || !profile._id) {
          console.log('No supervisor profile found - redirecting to setup');
          setRedirecting(true);
          navigate('/supervisor/profile-setup');
          return;
        }
        
        setSupervisorProfile(profile);
        currentProfileId = profile._id;
        const students = profile.supervisedStudents || [];
        setSupervisedStudents(students);
      } catch (err) {
        console.error('Error fetching supervisor profile:', err);
        // Redirect to setup for any error (404, 500, etc.) - profile doesn't exist or can't be fetched
        console.log('Supervisor profile error - redirecting to setup');
        setRedirecting(true);
        navigate('/supervisor/profile-setup');
        return;
      }

      // Fetch all therapists
      const therapistsResponse = await therapistService.getAllTherapists(1, 1000);
      const allTherapists = therapistsResponse.data.data.therapists || [];
      
      // Filter to only show therapists supervised by THIS supervisor
      const myTherapists = allTherapists.filter(t => {
        if (!t.supervisorId) return false;
        const therapistSupervisorId = typeof t.supervisorId === 'object' ? t.supervisorId?._id : t.supervisorId;
        return therapistSupervisorId === currentProfileId;
      });

      // Filter for students under this supervisor
      const myStudents = myTherapists.filter(t => t.isStudent);
      setSupervisedStudents(myStudents);

      // Filter for independent therapists (not students) who are pending verification
      // These can be verified by ANY supervisor
      const pendingIndependentTherapists = allTherapists.filter(t => 
        !t.isStudent && t.verificationStatus === 'pending'
      );
      
      // Combine relevant therapists for Recent Activity
      // Show my therapists AND any pending independent therapists
      const relevantTherapists = [...myTherapists, ...pendingIndependentTherapists];

      // Get recently updated therapists
      const sortedTherapists = relevantTherapists.sort((a, b) => 
        new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );
      
      // Remove duplicates if any (though sets should be disjoint)
      const uniqueRecentTherapists = Array.from(new Map(sortedTherapists.map(item => [item._id, item])).values());
      setRecentTherapists(uniqueRecentTherapists.slice(0, 5));

      // Count verified therapists supervised by this supervisor
      const verifiedTherapists = myTherapists.filter(t => t.verificationStatus === 'verified').length;

      // Calculate pending reviews 
      // (unverified therapists supervised by THIS supervisor + unverified independent therapists)
      const myPendingReviews = myTherapists.filter(t => t.verificationStatus === 'pending').length;
      const totalPendingReviews = myPendingReviews + pendingIndependentTherapists.length;

      setStats({
        therapists: verifiedTherapists,
        pendingReviews: totalPendingReviews
      });

    } catch (error) {
      console.error('Error fetching supervisor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' year' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' month' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' day' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hour' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minute' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';
    
    return 'Just now';
  };

  const dashboardStats = [
    { label: 'Supervised Therapists', value: loading ? '...' : (stats.therapists + stats.pendingReviews).toString(), icon: User, color: 'bg-[#9ECAD6]' },
    { label: 'Verified Therapists', value: loading ? '...' : stats.therapists.toString(), icon: Heart, color: 'bg-[#748DAE]' },
    { label: 'Pending Reviews', value: loading ? '...' : stats.pendingReviews.toString(), icon: FileText, color: 'bg-[#F5CBCB]' },
    { label: 'Total Students', value: loading ? '...' : supervisedStudents.length.toString(), icon: Settings, color: 'bg-[#9ECAD6]' },
  ];

  // Show redirecting state if profile doesn't exist
  if (redirecting) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Redirecting to profile setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Supervisor Profile ID Card */}
      {supervisorProfile && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#9ECAD6] to-[#748DAE] rounded-lg shadow-md p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Your Professional License Number</h3>
              <p className="text-sm opacity-90 mb-3">Share this number with student therapists to link them to your supervision</p>
              <div className="flex items-center gap-3">
                <code className="bg-white/20 px-4 py-2 rounded font-mono text-lg tracking-wide">
                  {supervisorProfile.professionalLicenseNumber}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(supervisorProfile.professionalLicenseNumber);
                    alert('Professional License Number copied to clipboard!');
                  }}
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded transition-colors"
                >
                  Copy ID
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#748DAE] mx-auto"></div>
            </div>
          ) : recentTherapists.length > 0 ? (
            <div className="space-y-3">
              {recentTherapists.map((therapist) => (
                <div key={therapist._id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900">
                    {therapist.verificationStatus === 'verified' 
                      ? `Therapist verified: ${therapist.userId?.fullName || 'Unknown'}`
                      : `New therapist onboarded: ${therapist.userId?.fullName || 'Unknown'}`
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{getTimeAgo(therapist.updatedAt || therapist.createdAt)}</p>
                  {therapist.verificationStatus === 'pending' && (
                    <div className="flex gap-2 mt-2">
                      <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                        Pending Verification
                      </span>
                      {!therapist.isStudent && (
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          Independent
                        </span>
                      )}
                    </div>
                  )}
                  {therapist.verificationStatus === 'verified' && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      Verified
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No recent activity</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/supervisor/manage-therapists')}
              className="w-full p-4 text-left bg-[#9ECAD6] hover:bg-[#8BB9C5] text-white rounded-lg transition-colors"
            >
              <p className="font-medium">Manage Therapists</p>
            </button>
            <button 
              onClick={() => navigate('/supervisor/reports')}
              className="w-full p-4 text-left bg-[#748DAE] hover:bg-[#657B9D] text-white rounded-lg transition-colors"
            >
              <p className="font-medium">View Reports</p>
            </button>
            <button 
              onClick={() => alert('Settings feature coming soon!')}
              className="w-full p-4 text-left bg-[#F5CBCB] hover:bg-[#E4BABA] text-white rounded-lg transition-colors"
            >
              <p className="font-medium">System Settings</p>
            </button>
          </div>

          {/* Supervised Students Section */}
          {supervisedStudents.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Supervised Students ({supervisedStudents.length})</h3>
              <div className="space-y-2">
                {supervisedStudents.slice(0, 3).map((student) => (
                  <div key={student._id} className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 bg-[#9ECAD6] rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-xs">
                        {student.userId?.fullName?.charAt(0) || 'S'}
                      </span>
                    </div>
                    <span className="text-gray-700">{student.userId?.fullName || student.userId?.email || 'Unknown Student'}</span>
                  </div>
                ))}
                {supervisedStudents.length > 3 && (
                  <p className="text-xs text-gray-500 mt-2">+{supervisedStudents.length - 3} more</p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const DefaultDashboard = ({ user }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg shadow-sm p-8 border border-gray-100 text-center"
    >
      <User className="h-16 w-16 mx-auto text-[#9ECAD6] mb-4" />
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to CareNest</h2>
      <p className="text-gray-600">Your dashboard is being set up. Please contact support if you need assistance.</p>
    </motion.div>
  );
};
