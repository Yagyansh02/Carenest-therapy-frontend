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
  Trash2,
  Search,
  Filter,
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { userService } from '../../api/user';
import { therapistService } from '../../api/therapist';
import { sessionService } from '../../api/session';
import { feedbackService } from '../../api/feedback';
import api from '../../api/axios';

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalTherapists: 0,
    totalSupervisors: 0,
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
    revenueOverTime: []
  });

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);
  const [togglingUser, setTogglingUser] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, users]);

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
      setFilteredUsers(allUsers);

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
      { name: 'Supervisors', count: users.filter(u => u.role === 'supervisor').length, color: '#F5CBCB' }
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

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
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

  const COLORS = ['#9ECAD6', '#748DAE', '#F5CBCB', '#10B981', '#F59E0B'];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive overview and management of CareNest platform</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalUsers}</h3>
            <p className="text-sm text-gray-600">Total Users</p>
            <div className="mt-3 flex gap-2 text-xs">
              <span className="text-[#9ECAD6]">Patients: {stats.totalPatients}</span>
              <span className="text-[#748DAE]">Therapists: {stats.totalTherapists}</span>
            </div>
          </motion.div>

          {/* Total Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-xs text-gray-500">Revenue</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">₹{stats.totalRevenue.toLocaleString()}</h3>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <div className="mt-3 text-xs text-gray-600">
              From {stats.completedSessions} completed sessions
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sessions Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-[#748DAE]" />
              <h3 className="text-lg font-semibold text-gray-900">Sessions (Last 7 Days)</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData.sessionsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sessions" stroke="#748DAE" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Sessions by Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="h-5 w-5 text-[#9ECAD6]" />
              <h3 className="text-lg font-semibold text-gray-900">Sessions by Status</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={chartData.sessionsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-[#F5CBCB]" />
              <h3 className="text-lg font-semibold text-gray-900">Users by Role</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#9ECAD6" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Therapists by Specialization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-[#748DAE]" />
              <h3 className="text-lg font-semibold text-gray-900">Top Specializations</h3>
            </div>
            {chartData.therapistsBySpecialization.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData.therapistsBySpecialization} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#748DAE" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-400">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No specializations data available</p>
                  <p className="text-xs mt-1">Therapists need to set their specializations</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* User Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#748DAE] focus:border-transparent text-sm"
                />
              </div>
              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#748DAE] focus:border-transparent text-sm"
              >
                <option value="all">All Roles</option>
                <option value="patient">Patients</option>
                <option value="therapist">Therapists</option>
                <option value="supervisor">Supervisors</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'patient' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'therapist' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'supervisor' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isActive ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 text-sm">
                          <XCircle className="h-4 w-4" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(user._id)}
                          disabled={togglingUser === user._id}
                          className={`${
                            user.isActive 
                              ? 'text-yellow-600 hover:text-yellow-800' 
                              : 'text-green-600 hover:text-green-800'
                          } transition-colors disabled:opacity-50`}
                          title={user.isActive ? 'Deactivate user' : 'Activate user'}
                        >
                          {togglingUser === user._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : user.isActive ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(user)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => !deletingUser && setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>{deleteConfirm.fullName}</strong> ({deleteConfirm.email})?
                This will permanently remove all their data.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deletingUser}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteUser(deleteConfirm._id)}
                  disabled={deletingUser}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deletingUser ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete User'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
