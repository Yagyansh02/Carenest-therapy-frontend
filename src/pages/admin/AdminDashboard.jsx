import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserCheck,
  Calendar,
  MessageSquare,
  TrendingUp,
  Activity,
  Star,
  DollarSign,
  BarChart3,
  PieChart,
  CheckCircle,
  XCircle,
  Loader2,
  LayoutDashboard
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { therapistService } from '../../api/therapist';
import { sessionService } from '../../api/session';
import { feedbackService } from '../../api/feedback';
import api from '../../api/axios';
import { UserManagement } from './UserManagement';

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',  label: 'Overview',        icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics',        icon: BarChart3 },
  { id: 'users',     label: 'User Management',  icon: Users },
];

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalTherapists: 0,
    totalSupervisors: 0,
    totalColleges: 0,
    totalSessions: 0,
    completedSessions: 0,
    pendingSessions: 0,
    totalFeedbacks: 0,
    averageRating: 0,
    totalRevenue: 0,
    verifiedTherapists: 0,
    pendingTherapists: 0
  });

  const [chartData, setChartData] = useState({
    sessionsOverTime: [],
    userGrowth: [],
    sessionsByStatus: [],
    therapistsBySpecialization: []
  });

  const [users, setUsers] = useState([]);

  // User management modal state (lifted so UserManagement component can use it)
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);
  const [togglingUser, setTogglingUser] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [usersRes, therapistsRes, sessionsRes, feedbacksRes] = await Promise.all([
        api.get('/users'),
        therapistService.getAllTherapists(1, 1000),
        sessionService.getAllSessions({ limit: 1000 }),
        feedbackService.getAllFeedbacks({ limit: 1000 })
      ]);

      const allUsers = usersRes.data.data.users || [];
      const allTherapists = therapistsRes.data.data.therapists || [];
      const allSessions = sessionsRes.data.data.sessions || [];
      const allFeedbacks = feedbacksRes.data.data.feedbacks || [];

      // Calculate stats
      const patients = allUsers.filter(u => u.role === 'patient');
      const therapists = allUsers.filter(u => u.role === 'therapist');
      const supervisors = allUsers.filter(u => u.role === 'supervisor');
      const colleges = allUsers.filter(u => u.role === 'college');
      const completedSessions = allSessions.filter(s => s.status === 'completed');
      const pendingSessions = allSessions.filter(s => s.status === 'pending' || s.status === 'confirmed');
      const verifiedTherapists = allTherapists.filter(t => t.verificationStatus === 'verified');
      const pendingTherapists = allTherapists.filter(t => t.verificationStatus === 'pending');
      
      const totalRevenue = completedSessions.reduce((sum, s) => sum + (s.sessionFee || 0), 0);
      const averageRating = allFeedbacks.length > 0
        ? allFeedbacks.reduce((sum, f) => sum + f.overallRating, 0) / allFeedbacks.length
        : 0;

      setStats({
        totalUsers: allUsers.length,
        totalPatients: patients.length,
        totalTherapists: therapists.length,
        totalSupervisors: supervisors.length,
        totalColleges: colleges.length,
        totalSessions: allSessions.length,
        completedSessions: completedSessions.length,
        pendingSessions: pendingSessions.length,
        totalFeedbacks: allFeedbacks.length,
        averageRating: averageRating,
        totalRevenue: totalRevenue,
        verifiedTherapists: verifiedTherapists.length,
        pendingTherapists: pendingTherapists.length
      });

      // Prepare chart data
      prepareChartData(allSessions, allUsers, allTherapists);
      
      setUsers(allUsers);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (sessions, users, therapists) => {
    // Sessions by status - using website theme colors
    const sessionsByStatus = [
      { name: 'Completed', value: sessions.filter(s => s.status === 'completed').length, color: '#10B981' },
      { name: 'Pending', value: sessions.filter(s => s.status === 'pending').length, color: '#F59E0B' },
      { name: 'Confirmed', value: sessions.filter(s => s.status === 'confirmed').length, color: '#748DAE' },
      { name: 'Cancelled', value: sessions.filter(s => s.status === 'cancelled').length, color: '#F5CBCB' }
    ];

    // User growth by role
    const userGrowth = [
      { name: 'Patients', count: users.filter(u => u.role === 'patient').length, color: '#9ECAD6' },
      { name: 'Therapists', count: users.filter(u => u.role === 'therapist').length, color: '#748DAE' },
      { name: 'Supervisors', count: users.filter(u => u.role === 'supervisor').length, color: '#F5CBCB' },
      { name: 'Colleges', count: users.filter(u => u.role === 'college').length, color: '#A8D5BA' }
    ];

    // Sessions over time (last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const sessionsOverTime = last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sessions: sessions.filter(s => 
        new Date(s.scheduledAt).toISOString().split('T')[0] === date
      ).length
    }));

    // Therapists by specialization (top 5)
    const specializationCounts = {};
    therapists.forEach(t => {
      if (t.specializations && t.specializations.length > 0) {
        t.specializations.forEach(spec => {
          specializationCounts[spec] = (specializationCounts[spec] || 0) + 1;
        });
      }
    });

    const therapistsBySpecialization = Object.entries(specializationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    setChartData({
      sessionsOverTime,
      userGrowth,
      sessionsByStatus,
      therapistsBySpecialization
    });
  };

  const handleDeleteUser = async (userId) => {
    try {
      setDeletingUser(true);
      await api.delete(`/users/${userId}`);
      
      // Update state locally by removing the deleted user
      const deletedUser = users.find(u => u._id === userId);
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      
      // Update stats locally
      if (deletedUser) {
        setStats(prevStats => ({
          ...prevStats,
          totalUsers: prevStats.totalUsers - 1,
          totalPatients: deletedUser.role === 'patient' ? prevStats.totalPatients - 1 : prevStats.totalPatients,
          totalTherapists: deletedUser.role === 'therapist' ? prevStats.totalTherapists - 1 : prevStats.totalTherapists,
          totalSupervisors: deletedUser.role === 'supervisor' ? prevStats.totalSupervisors - 1 : prevStats.totalSupervisors,
          totalColleges: deletedUser.role === 'college' ? prevStats.totalColleges - 1 : prevStats.totalColleges,
        }));
      }
      
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeletingUser(false);
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      setTogglingUser(userId);
      const response = await api.patch(`/users/${userId}/toggle-active`);
      
      // Update state locally without refetching everything
      const updatedUser = response.data.data;
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, isActive: updatedUser.isActive } : user
        )
      );
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert(error.response?.data?.message || 'Failed to toggle user status');
    } finally {
      setTogglingUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#748DAE] mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // ─── Tab panels ──────────────────────────────────────────────────────────────
  const OverviewPanel = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-100 rounded-lg"><Users className="h-6 w-6 text-blue-600" /></div>
          <span className="text-xs text-gray-500">Total</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalUsers}</h3>
        <p className="text-sm text-gray-600">Total Users</p>
        <div className="mt-3 flex gap-2 text-xs flex-wrap">
          <span className="text-[#9ECAD6]">Patients: {stats.totalPatients}</span>
          <span className="text-[#748DAE]">Therapists: {stats.totalTherapists}</span>
          <span className="text-[#F5CBCB]">Supervisors: {stats.totalSupervisors}</span>
        </div>
      </motion.div>

      {/* Total Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-green-100 rounded-lg"><Calendar className="h-6 w-6 text-green-600" /></div>
          <span className="text-xs text-gray-500">Sessions</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalSessions}</h3>
        <p className="text-sm text-gray-600">Total Sessions</p>
        <div className="mt-3 flex gap-2 text-xs">
          <span className="text-green-600">Completed: {stats.completedSessions}</span>
          <span className="text-yellow-600">Pending: {stats.pendingSessions}</span>
        </div>
      </motion.div>

      {/* Total Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-purple-100 rounded-lg"><MessageSquare className="h-6 w-6 text-purple-600" /></div>
          <span className="text-xs text-gray-500">Feedback</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalFeedbacks}</h3>
        <p className="text-sm text-gray-600">Total Feedback</p>
        <div className="mt-3 flex items-center gap-1 text-xs">
          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
          <span className="text-gray-600">Avg: {stats.averageRating.toFixed(1)}/5</span>
        </div>
      </motion.div>

      {/* Total Revenue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-yellow-100 rounded-lg"><DollarSign className="h-6 w-6 text-yellow-600" /></div>
          <span className="text-xs text-gray-500">Revenue</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">₹{stats.totalRevenue.toLocaleString()}</h3>
        <p className="text-sm text-gray-600">Total Revenue</p>
        <div className="mt-3 text-xs text-gray-600">From {stats.completedSessions} completed sessions</div>
      </motion.div>

      {/* Therapist Verification */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-teal-100 rounded-lg"><UserCheck className="h-6 w-6 text-teal-600" /></div>
          <span className="text-xs text-gray-500">Therapists</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalTherapists}</h3>
        <p className="text-sm text-gray-600">Registered Therapists</p>
        <div className="mt-3 flex gap-2 text-xs flex-wrap">
          <span className="flex items-center gap-1 text-green-600"><CheckCircle className="h-3 w-3" /> Verified: {stats.verifiedTherapists}</span>
          <span className="text-yellow-600">Pending: {stats.pendingTherapists}</span>
        </div>
      </motion.div>

      {/* Platform at a Glance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-1 lg:col-span-3"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-[#748DAE]" />
          <h3 className="text-base font-semibold text-gray-900">Platform at a Glance</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Completion Rate', value: stats.totalSessions > 0 ? `${((stats.completedSessions / stats.totalSessions) * 100).toFixed(0)}%` : '—', color: 'text-green-600' },
            { label: 'Active Users',    value: users.filter(u => u.isActive).length,  color: 'text-blue-600' },
            { label: 'Inactive Users',  value: users.filter(u => !u.isActive).length, color: 'text-red-500' },
            { label: 'Avg Rating',      value: `${stats.averageRating.toFixed(1)} ★`,  color: 'text-yellow-500' },
          ].map(item => (
            <div key={item.label} className="bg-gray-50 rounded-lg p-4 text-center">
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-gray-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const AnalyticsPanel = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sessions Over Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-[#748DAE]" />
          <h3 className="text-lg font-semibold text-gray-900">Sessions (Last 7 Days)</h3>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData.sessionsOverTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sessions" stroke="#748DAE" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Sessions by Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="h-5 w-5 text-[#9ECAD6]" />
          <h3 className="text-lg font-semibold text-gray-900">Sessions by Status</h3>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <RePieChart>
            <Pie
              data={chartData.sessionsByStatus}
              cx="50%" cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={90}
              dataKey="value"
            >
              {chartData.sessionsByStatus.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </RePieChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Users by Role */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-[#F5CBCB]" />
          <h3 className="text-lg font-semibold text-gray-900">Users by Role</h3>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData.userGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#9ECAD6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Therapists by Specialization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-[#748DAE]" />
          <h3 className="text-lg font-semibold text-gray-900">Top Specializations</h3>
        </div>
        {chartData.therapistsBySpecialization.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData.therapistsBySpecialization} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                width={120}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
              />
              <Tooltip />
              <Bar dataKey="value" fill="#748DAE" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[280px] text-gray-400">
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No specializations data available</p>
              <p className="text-xs mt-1">Therapists need to set their specializations</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive overview and management of CareNest platform</p>
        </motion.div>

        {/* Tab Bar */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex gap-1" aria-label="Dashboard tabs">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors focus:outline-none ${
                  activeTab === id ? 'text-[#748DAE]' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                {activeTab === id && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#748DAE] rounded-full"
                  />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview'  && <OverviewPanel />}
            {activeTab === 'analytics' && <AnalyticsPanel />}
            {activeTab === 'users' && (
              <UserManagement
                users={users}
                onDelete={handleDeleteUser}
                onToggleActive={handleToggleActive}
                deletingUser={deletingUser}
                togglingUser={togglingUser}
                deleteConfirm={deleteConfirm}
                setDeleteConfirm={setDeleteConfirm}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
