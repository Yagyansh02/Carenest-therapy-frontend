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
  LayoutDashboard,
  Award,
  GraduationCap,
  Percent,
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
    therapistsBySpecialization: [],
    monthlyRevenue: [],
    monthlySignups: [],
    topTherapists: [],
    ratingDistribution: [],
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
      prepareChartData(allSessions, allUsers, allTherapists, allFeedbacks);
      
      setUsers(allUsers);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (sessions, users, therapists, feedbacks) => {
    // ── Sessions by status ──────────────────────────────────────────────────
    const sessionsByStatus = [
      { name: 'Completed', value: sessions.filter(s => s.status === 'completed').length, color: '#10B981' },
      { name: 'Pending',   value: sessions.filter(s => s.status === 'pending').length,   color: '#F59E0B' },
      { name: 'Confirmed', value: sessions.filter(s => s.status === 'confirmed').length, color: '#748DAE' },
      { name: 'Cancelled', value: sessions.filter(s => s.status === 'cancelled').length, color: '#EF4444' },
    ];

    // ── Current user distribution by role ───────────────────────────────────
    const userGrowth = [
      { name: 'Patients',   count: users.filter(u => u.role === 'patient').length,    color: '#9ECAD6' },
      { name: 'Therapists', count: users.filter(u => u.role === 'therapist').length,  color: '#748DAE' },
      { name: 'Supervisors',count: users.filter(u => u.role === 'supervisor').length, color: '#F5CBCB' },
      { name: 'Colleges',   count: users.filter(u => u.role === 'college').length,    color: '#A8D5BA' },
    ];

    // ── Sessions over time (last 14 days) ───────────────────────────────────
    const last14Days = [...Array(14)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d.toISOString().split('T')[0];
    });
    const sessionsOverTime = last14Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sessions: sessions.filter(s =>
        new Date(s.scheduledAt).toISOString().split('T')[0] === date
      ).length,
    }));

    // ── Therapists by specialization (top 5) ────────────────────────────────
    const specializationCounts = {};
    therapists.forEach(t => {
      (t.specializations || []).forEach(spec => {
        specializationCounts[spec] = (specializationCounts[spec] || 0) + 1;
      });
    });
    const therapistsBySpecialization = Object.entries(specializationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    // ── Monthly revenue + session volume (last 6 months) ───────────────────
    const last6Months = [...Array(6)].map((_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (5 - i));
      return { year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) };
    });
    const monthlyRevenue = last6Months.map(({ year, month, label }) => {
      const mo = sessions.filter(s => {
        const d = new Date(s.scheduledAt);
        return d.getFullYear() === year && d.getMonth() === month;
      });
      const completed = mo.filter(s => s.status === 'completed');
      return {
        month: label,
        revenue: completed.reduce((sum, s) => sum + (s.sessionFee || 0), 0),
        sessions: mo.length,
        completed: completed.length,
      };
    });

    // ── Monthly new sign-ups by role (last 6 months) ────────────────────────
    const monthlySignups = last6Months.map(({ year, month, label }) => {
      const mo = users.filter(u => {
        const d = new Date(u.createdAt);
        return d.getFullYear() === year && d.getMonth() === month;
      });
      return {
        month: label,
        Patients:   mo.filter(u => u.role === 'patient').length,
        Therapists: mo.filter(u => u.role === 'therapist').length,
        Supervisors:mo.filter(u => u.role === 'supervisor').length,
        Colleges:   mo.filter(u => u.role === 'college').length,
      };
    });

    // ── Top 5 therapists by session count ───────────────────────────────────
    const statsById = {};
    sessions.forEach(s => {
      const raw = s.therapistId;
      if (!raw) return;
      const id = (typeof raw === 'object' ? raw._id : raw)?.toString();
      if (!id) return;
      if (!statsById[id]) statsById[id] = { sessions: 0, completed: 0, revenue: 0, name: typeof raw === 'object' ? raw.fullName : null };
      statsById[id].sessions++;
      if (s.status === 'completed') {
        statsById[id].completed++;
        statsById[id].revenue += s.sessionFee || 0;
      }
    });
    // Enrich with therapist profile data (name, rating)
    const topTherapists = therapists
      .map(t => {
        const uid = (typeof t.userId === 'object' ? t.userId?._id : t.userId)?.toString();
        const name = typeof t.userId === 'object' ? t.userId?.fullName : null;
        const s = statsById[uid] || { sessions: 0, completed: 0, revenue: 0 };
        return {
          name: s.name || name || 'Unknown',
          sessions: s.sessions,
          completed: s.completed,
          revenue: s.revenue,
          rating: t.averageRating || 0,
          completionRate: s.sessions > 0 ? Math.round((s.completed / s.sessions) * 100) : 0,
        };
      })
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 5);

    // ── Rating distribution (1–5 stars) ─────────────────────────────────────
    const ratingDistribution = [5, 4, 3, 2, 1].map(r => ({
      rating: `${r} ★`,
      count: (feedbacks || []).filter(f => Math.round(f.overallRating) === r).length,
    }));

    setChartData({
      sessionsOverTime,
      userGrowth,
      sessionsByStatus,
      therapistsBySpecialization,
      monthlyRevenue,
      monthlySignups,
      topTherapists,
      ratingDistribution,
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
          <span className="text-teal-600">Colleges: {stats.totalColleges}</span>
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
    <div className="space-y-6">

      {/* ── Row 1: Revenue trend + Monthly sign-ups ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Monthly Revenue & Session Volume */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-5 w-5 text-[#748DAE]" />
            <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">Revenue and total sessions over the last 6 months</p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData.monthlyRevenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#748DAE" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#748DAE" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val, name) => name === 'revenue' ? [`₹${val.toLocaleString()}`, 'Revenue'] : [val, 'Sessions']} />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#748DAE" strokeWidth={2} fill="url(#revGrad)" name="revenue" />
              <Area yAxisId="right" type="monotone" dataKey="sessions" stroke="#10B981" strokeWidth={2} fill="url(#sesGrad)" name="sessions" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Sign-ups by Role */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5 text-[#9ECAD6]" />
            <h3 className="text-lg font-semibold text-gray-900">New Registrations</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">New users by role over the last 6 months</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData.monthlySignups}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Patients"   fill="#9ECAD6" radius={[3,3,0,0]} stackId="a" />
              <Bar dataKey="Therapists" fill="#748DAE" radius={[3,3,0,0]} stackId="a" />
              <Bar dataKey="Supervisors" fill="#F5CBCB" radius={[3,3,0,0]} stackId="a" />
              <Bar dataKey="Colleges"   fill="#A8D5BA" radius={[3,3,0,0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Row 2: Sessions by Status + Rating Distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Sessions by Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <PieChart className="h-5 w-5 text-[#9ECAD6]" />
            <h3 className="text-lg font-semibold text-gray-900">Sessions by Status</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">Breakdown of all sessions by their current status</p>
          <ResponsiveContainer width="100%" height={280}>
            <RePieChart>
              <Pie
                data={chartData.sessionsByStatus}
                cx="50%" cy="50%"
                labelLine={false}
                label={({ name, percent }) => percent > 0.04 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                outerRadius={100}
                innerRadius={40}
                dataKey="value"
                paddingAngle={2}
              >
                {chartData.sessionsByStatus.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(val, name) => [val, name]} />
              <Legend />
            </RePieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Rating Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-gray-900">Feedback Rating Distribution</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">How patients rate their therapy sessions</p>
          {chartData.ratingDistribution.every(r => r.count === 0) ? (
            <div className="flex items-center justify-center h-[280px] text-gray-400">
              <div className="text-center">
                <Star className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No ratings yet</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData.ratingDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis dataKey="rating" type="category" width={40} tick={{ fontSize: 13 }} />
                <Tooltip formatter={(val) => [val, 'Reviews']} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {chartData.ratingDistribution.map((_, i) => (
                    <Cell key={i} fill={['#10B981','#60A5FA','#FBBF24','#F97316','#EF4444'][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* ── Row 3: Top Therapists + Specializations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Therapists Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <Award className="h-5 w-5 text-[#748DAE]" />
            <h3 className="text-lg font-semibold text-gray-900">Top Therapists</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">Ranked by total sessions — completed sessions, revenue &amp; rating</p>
          {chartData.topTherapists.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <div className="text-center">
                <Award className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No session data yet</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {chartData.topTherapists.map((t, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors">
                  {/* Rank badge */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-gray-200 text-gray-600' :
                    i === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-50 text-[#748DAE]'
                  }`}>{i + 1}</div>

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[#EBF3F6] flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[#748DAE]">{t.name?.charAt(0)?.toUpperCase()}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{t.name}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" />{t.sessions} sessions</span>
                      <span className="flex items-center gap-0.5 text-green-600"><CheckCircle className="h-3 w-3" />{t.completionRate}%</span>
                    </div>
                  </div>

                  {/* Revenue + rating */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-800">₹{t.revenue.toLocaleString()}</p>
                    {t.rating > 0 && (
                      <p className="text-xs text-yellow-500 flex items-center justify-end gap-0.5">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{t.rating.toFixed(1)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Therapists by Specialization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-5 w-5 text-[#748DAE]" />
            <h3 className="text-lg font-semibold text-gray-900">Top Specializations</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">Number of therapists per specialization area</p>
          {chartData.therapistsBySpecialization.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData.therapistsBySpecialization} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={130}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => v.length > 18 ? v.substring(0, 18) + '…' : v}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#748DAE" radius={[0, 4, 4, 0]} name="Therapists" />
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

      {/* ── Row 4: Sessions Over Time (14 days) + Users by Role ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Sessions Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-5 w-5 text-[#748DAE]" />
            <h3 className="text-lg font-semibold text-gray-900">Session Activity</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">Total sessions scheduled per day over the last 14 days</p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData.sessionsOverTime}>
              <defs>
                <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9ECAD6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#9ECAD6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={1} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="sessions" stroke="#748DAE" strokeWidth={2} fill="url(#actGrad)" dot={{ r: 3 }} name="Sessions" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Users by Role */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-5 w-5 text-[#F5CBCB]" />
            <h3 className="text-lg font-semibold text-gray-900">Users by Role</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">Current total registered users per role</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Users">
                {chartData.userGrowth.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

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
