import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  Award,
  Briefcase,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  TrendingUp,
  XCircle,
  UserCheck,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { PatientAssessmentButton } from './PatientAssessmentButton';
import { therapistService } from '../../api/therapist';
import { sessionService } from '../../api/session';

export const TherapistDashboardContent = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [todaySessions, setTodaySessions] = useState([]);
  const [pendingSessions, setPendingSessions] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateSessions, setSelectedDateSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Helper to get local date string (YYYY-MM-DD)
  const getLocalDateString = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Filter sessions for selected date
    if (selectedDate && allSessions.length > 0) {
      const selectedDateStr = getLocalDateString(selectedDate);
      const sessionsOnDate = allSessions.filter(session => {
        const sessionDate = getLocalDateString(session.scheduledAt);
        return sessionDate === selectedDateStr;
      });
      setSelectedDateSessions(sessionsOnDate);
    } else {
      setSelectedDateSessions([]);
    }
  }, [selectedDate, allSessions]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const today = getLocalDateString(new Date());
      const [profileRes, statsRes, todaySessionsRes, pendingSessionsRes, allSessionsRes] = await Promise.all([
        therapistService.getMyProfile(),
        sessionService.getTherapistStatistics(),
        sessionService.getMyTherapistSessions({
          startDate: today,
          endDate: today,
          limit: 50,
        }),
        sessionService.getPendingSessions(),
        sessionService.getMyTherapistSessions({
          limit: 100, // Get more sessions to show on calendar
        }),
      ]);

      setProfile(profileRes.data.data);
      setStatistics(statsRes.data.data);
      setTodaySessions(todaySessionsRes.data.data.sessions || []);
      setPendingSessions(pendingSessionsRes.data.data.sessions || []);
      setAllSessions(allSessionsRes.data.data.sessions || []);
    } catch (err) {
      // Only set error state if it's NOT a 404 (profile not found)
      if (err.statusCode === 404 || err.response?.status === 404) {
        setProfile(null);
        navigate('/therapist/setup-profile');
      } else {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || err.response?.data?.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#748DAE]"></div>
      </div>
    );
  }

  // Show error state for non-404 errors
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Error Loading Dashboard
            </h3>
            <p className="text-red-800 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show "Complete Profile" UI if no profile found (404)
  // This is a fallback in case the redirect doesn't happen fast enough or is cancelled
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#748DAE] mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to profile setup...</p>
        </div>
      </div>
    );
  }

  const statsDisplay = [
    { 
      label: 'Today\'s Sessions', 
      value: todaySessions.length, 
      icon: Calendar, 
      color: 'bg-[#9ECAD6]',
      subtext: `${todaySessions.filter(s => s.status === 'confirmed').length} confirmed`
    },
    { 
      label: 'Pending Requests', 
      value: pendingSessions.length, 
      icon: Clock, 
      color: 'bg-[#E8D4A8]',
      subtext: 'awaiting response'
    },
    { 
      label: 'Completed Sessions', 
      value: statistics?.completedSessions || 0, 
      icon: CheckCircle, 
      color: 'bg-[#9ECAD6]',
      subtext: `${statistics?.completionRate || 0}% completion rate`
    },
    { 
      label: 'Total Revenue', 
      value: `$${statistics?.totalRevenue?.toFixed(0) || 0}`, 
      icon: TrendingUp, 
      color: 'bg-[#748DAE]',
      subtext: 'from completed sessions'
    },
  ];

  const getVerificationStatusBadge = () => {
    const status = profile?.verificationStatus || 'pending';
    const configs = {
      verified: { color: 'bg-green-100 text-green-800', text: 'Verified' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Verification' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Verification Rejected' },
    };
    
    return configs[status] || configs.pending;
  };

  const statusBadge = getVerificationStatusBadge();

  return (
    <div className="space-y-8">
      {/* Pending Requests Alert */}
      {pendingSessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">
                You have {pendingSessions.length} pending session request{pendingSessions.length > 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Review and respond to session requests from patients
              </p>
            </div>
            <button
              onClick={() => navigate('/therapist/sessions?filter=pending')}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
            >
              Review Now
            </button>
          </div>
        </motion.div>
      )}

      {/* Profile Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#748DAE] to-[#9ECAD6] rounded-2xl shadow-lg p-8 text-white"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">{user?.fullName}</h2>
            <p className="text-white/90 mb-4">{user?.email}</p>
            
            <div className="flex flex-wrap gap-3 mb-6">
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${statusBadge.color}`}>
                {statusBadge.text}
              </span>
              {profile?.isStudent && (
                <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm">
                  Student Therapist
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <div>
                  <p className="text-white/70 text-sm">Session Rate</p>
                  <p className="font-semibold">${profile?.sessionRate || 0}/session</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <div>
                  <p className="text-white/70 text-sm">Experience</p>
                  <p className="font-semibold">{profile?.yearsOfExperience || 0} years</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                <div>
                  <p className="text-white/70 text-sm">Rating</p>
                  <p className="font-semibold">{profile?.averageRating?.toFixed(1) || 'N/A'} ⭐</p>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/therapist/setup-profile')}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
          >
            <Edit className="h-5 w-5" />
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsDisplay.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                {stat.subtext && (
                  <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
                )}
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Professional Info & Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Professional Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#748DAE]" />
              Professional Information
            </h3>
            
            <div className="space-y-3">
              {/* Bio */}
              {profile?.bio && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">About</p>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{profile.bio}</p>
                </div>
              )}

              {/* License Number & Specializations Grid */}
              <div className="grid grid-cols-1 gap-3">
                {profile?.licenseNumber && (
                  <div className="p-2.5 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-0.5">License Number</p>
                    <p className="text-sm text-gray-900 font-medium">{profile.licenseNumber}</p>
                  </div>
                )}

                {/* Specializations */}
                {profile?.specializations && profile.specializations.length > 0 && (
                  <div className="p-2.5 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-1.5">Specializations</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.specializations.slice(0, 4).map((spec, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-0.5 bg-[#9ECAD6]/20 text-[#748DAE] rounded-full text-xs font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                      {profile.specializations.length > 4 && (
                        <span className="px-2.5 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">
                          +{profile.specializations.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Qualifications - Compact */}
              {profile?.qualifications && profile.qualifications.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5" />
                    Qualifications
                  </p>
                  <div className="space-y-1.5">
                    {profile.qualifications.slice(0, 2).map((qual, index) => (
                      <div key={index} className="p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">{qual.degree}</p>
                        <p className="text-xs text-gray-600">{qual.institution}{qual.year && ` (${qual.year})`}</p>
                      </div>
                    ))}
                    {profile.qualifications.length > 2 && (
                      <p className="text-xs text-gray-500 italic">+{profile.qualifications.length - 2} more qualification(s)</p>
                    )}
                  </div>
                </div>
              )}

              {/* Supervisor */}
              {profile?.isStudent && profile?.supervisorId && (
                <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs font-medium text-blue-700 mb-0.5">Supervisor</p>
                  <p className="text-sm text-blue-900 font-medium">
                    {profile.supervisorId.fullName || profile.supervisorId.email}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Charts Grid - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Session Distribution Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-[#748DAE]" />
                Session Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: statistics?.completedSessions || 0, color: '#9ECAD6' },
                        { name: 'Scheduled', value: statistics?.scheduledSessions || 0, color: '#B8D4E8' },
                        { name: 'Cancelled', value: statistics?.cancelledSessions || 0, color: '#E8C4C4' },
                        { name: 'No Show', value: statistics?.noShowSessions || 0, color: '#D5D5D5' },
                      ]}
                      cx="50%"
                      cy="45%"
                      labelLine={false}
                      label={false}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Completed', value: statistics?.completedSessions || 0, color: '#9ECAD6' },
                        { name: 'Scheduled', value: statistics?.scheduledSessions || 0, color: '#B8D4E8' },
                        { name: 'Cancelled', value: statistics?.cancelledSessions || 0, color: '#E8C4C4' },
                        { name: 'No Show', value: statistics?.noShowSessions || 0, color: '#D5D5D5' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Revenue & Performance Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#748DAE]" />
                Performance Overview
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: 'Sessions',
                        Total: statistics?.totalSessions || 0,
                        Completed: statistics?.completedSessions || 0,
                        Cancelled: statistics?.cancelledSessions || 0,
                      }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Total" fill="#748DAE" />
                    <Bar dataKey="Completed" fill="#9ECAD6" />
                    <Bar dataKey="Cancelled" fill="#E8C4C4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Revenue Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#748DAE]" />
              Revenue Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-gradient-to-r from-[#9ECAD6]/20 to-[#9ECAD6]/30 rounded-lg">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-[#748DAE]">${statistics?.totalRevenue?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-[#748DAE]/20 to-[#748DAE]/30 rounded-lg">
                <p className="text-sm text-gray-600">Avg per Session</p>
                <p className="text-2xl font-bold text-[#748DAE]">
                  ${statistics?.completedSessions > 0 
                    ? (statistics.totalRevenue / statistics.completedSessions).toFixed(2) 
                    : '0.00'}
                </p>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { month: 'This Month', revenue: statistics?.totalRevenue || 0 }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#748DAE" fill="#9ECAD6" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Calendar & Sessions */}
        <div className="space-y-6">
          {/* Calendar Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#748DAE]" />
              Session Calendar
            </h3>
            <div className="calendar-container">
              <ReactCalendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="border-0 w-full"
                tileClassName={({ date }) => {
                  const dateStr = getLocalDateString(date);
                  const today = getLocalDateString(new Date());
                  
                  // Check if this date has any sessions
                  const hasSession = allSessions.some(session => {
                    const sessionDate = getLocalDateString(session.scheduledAt);
                    return sessionDate === dateStr;
                  });
                  
                  if (dateStr === today) {
                    return 'bg-[#748DAE] text-white rounded-lg';
                  }
                  
                  if (hasSession) {
                    return 'has-session';
                  }
                  
                  return '';
                }}
                tileContent={({ date }) => {
                  const dateStr = getLocalDateString(date);
                  const sessionsOnDate = allSessions.filter(session => {
                    const sessionDate = getLocalDateString(session.scheduledAt);
                    return sessionDate === dateStr;
                  });
                  
                  if (sessionsOnDate.length > 0) {
                    return (
                      <div className="flex justify-center mt-1">
                        <div className="w-1.5 h-1.5 bg-[#9ECAD6] rounded-full"></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </div>
            
            {/* Calendar Legend */}
            <div className="mt-3 p-2.5 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-700 mb-2">Legend</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-5 h-5 bg-[#748DAE] rounded"></div>
                  <span className="text-gray-600">Today</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-5 h-5 bg-[#e0f2f7] rounded flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-[#9ECAD6] rounded-full"></div>
                  </div>
                  <span className="text-gray-600">Has Sessions</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Today's Sessions & Manage Sessions Combined Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex flex-col"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#748DAE]" />
                Today's Sessions
              </h3>
              <button
                onClick={() => navigate('/therapist/sessions')}
                className="text-sm text-[#748DAE] hover:text-[#657B9D] font-medium"
              >
                View All →
              </button>
            </div>
            
            {todaySessions.length > 0 ? (
              <div className="space-y-2.5 max-h-40 overflow-y-auto mb-3 flex-1">
                {todaySessions.map((session) => (
                  <div
                    key={session._id}
                    className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/sessions/${session._id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          {session.patientId?.fullName || 'Unknown Patient'}
                        </p>
                        {session.patientId && (
                          <div className="mt-1 mb-1">
                            <PatientAssessmentButton 
                              patientId={session.patientId._id} 
                              patientName={session.patientId.fullName} 
                            />
                          </div>
                        )}
                        <p className="text-xs text-gray-600">
                          {new Date(session.scheduledAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        session.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : session.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 mb-3 flex-1 flex flex-col items-center justify-center">
                <Calendar className="h-10 w-10 text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No sessions scheduled for today</p>
              </div>
            )}

            {/* Manage Sessions Button - Now inside the card */}
            <button
              onClick={() => navigate('/therapist/sessions')}
              className="w-full p-3.5 bg-gradient-to-r from-[#9ECAD6] to-[#748DAE] hover:from-[#8BB9C5] hover:to-[#657B9D] text-white rounded-xl shadow-sm transition-all transform hover:scale-[1.02] flex items-center justify-between group mt-auto"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Manage Sessions</p>
                  <p className="text-xs text-white/90">View and update schedule</p>
                </div>
              </div>
              {pendingSessions.length > 0 && (
                <span className="bg-white text-[#748DAE] px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  {pendingSessions.length} pending
                </span>
              )}
            </button>
          </motion.div>

          {/* Session Statistics Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2.5 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#748DAE]" />
              Session Statistics
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col items-center justify-center p-2.5 bg-[#748DAE]/10 rounded-lg">
                <Calendar className="h-5 w-5 text-[#748DAE] mb-0.5" />
                <p className="text-[10px] text-gray-600">Total</p>
                <p className="text-base font-bold text-gray-900">{statistics?.totalSessions || 0}</p>
              </div>
              
              <div className="flex flex-col items-center justify-center p-2.5 bg-[#9ECAD6]/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-[#9ECAD6] mb-0.5" />
                <p className="text-[10px] text-gray-600">Completed</p>
                <p className="text-base font-bold text-[#748DAE]">{statistics?.completedSessions || 0}</p>
              </div>

              <div className="flex flex-col items-center justify-center p-2.5 bg-[#B8D4E8]/30 rounded-lg">
                <Clock className="h-5 w-5 text-[#748DAE] mb-0.5" />
                <p className="text-[10px] text-gray-600">Scheduled</p>
                <p className="text-base font-bold text-[#748DAE]">{statistics?.scheduledSessions || 0}</p>
              </div>

              <div className="flex flex-col items-center justify-center p-2.5 bg-[#E8C4C4]/40 rounded-lg">
                <XCircle className="h-5 w-5 text-[#B89A9A] mb-0.5" />
                <p className="text-[10px] text-gray-600">Cancelled</p>
                <p className="text-base font-bold text-[#B89A9A]">{statistics?.cancelledSessions || 0}</p>
              </div>
            </div>
            
            <div className="mt-2.5 flex items-center justify-between p-2.5 bg-[#9ECAD6]/20 rounded-lg">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-5 w-5 text-[#9ECAD6]" />
                <p className="text-[11px] text-gray-600">Completion Rate</p>
              </div>
              <p className="text-lg font-bold text-[#748DAE]">{statistics?.completionRate || 0}%</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
