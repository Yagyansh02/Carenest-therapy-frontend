import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserDetailPanel } from './UserDetailPanel';
import {
  Users,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  SlidersHorizontal,
  X,
  Calendar,
  ArrowUpDown,
  UserCheck,
  ChevronDown,
} from 'lucide-react';

// Account age in days from createdAt
const accountAgeDays = (createdAt) =>
  Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000);

const AGE_GROUPS = [
  { value: 'all',         label: 'All' },
  { value: 'new',         label: 'New (< 30 days)' },
  { value: 'recent',      label: 'Recent (30–90 days)' },
  { value: 'established', label: 'Established (90–365 days)' },
  { value: 'veteran',     label: 'Veteran (> 1 year)' },
];

const matchesAgeGroup = (user, group) => {
  if (group === 'all') return true;
  const d = accountAgeDays(user.createdAt);
  if (group === 'new')         return d < 30;
  if (group === 'recent')      return d >= 30  && d < 90;
  if (group === 'established') return d >= 90  && d < 365;
  if (group === 'veteran')     return d >= 365;
  return true;
};

export const UserManagement = ({
  users,
  onDelete,
  onToggleActive,
  deletingUser,
  togglingUser,
  deleteConfirm,
  setDeleteConfirm
}) => {
  const [searchTerm, setSearchTerm]   = useState('');
  const [roleFilter, setRoleFilter]   = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');   // all | active | inactive
  const [ageGroup, setAgeGroup]       = useState('all');
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');
  const [sortBy, setSortBy]           = useState('newest');  // newest | oldest | name-asc | name-desc
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Count active non-search filters for the badge
  const activeFilterCount = useMemo(() => [
    roleFilter   !== 'all',
    statusFilter !== 'all',
    ageGroup     !== 'all',
    !!dateFrom,
    !!dateTo,
    sortBy       !== 'newest',
  ].filter(Boolean).length, [roleFilter, statusFilter, ageGroup, dateFrom, dateTo, sortBy]);

  const clearAllFilters = () => {
    setRoleFilter('all');
    setStatusFilter('all');
    setAgeGroup('all');
    setDateFrom('');
    setDateTo('');
    setSortBy('newest');
  };

  const filteredUsers = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom).getTime() : null;
    const to   = dateTo   ? new Date(dateTo + 'T23:59:59').getTime() : null;

    const filtered = users.filter((user) => {
      const ts = new Date(user.createdAt).getTime();

      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        if (!user.fullName?.toLowerCase().includes(q) && !user.email?.toLowerCase().includes(q))
          return false;
      }
      if (roleFilter   !== 'all' && user.role !== roleFilter) return false;
      if (statusFilter === 'active'   && !user.isActive) return false;
      if (statusFilter === 'inactive' &&  user.isActive) return false;
      if (!matchesAgeGroup(user, ageGroup)) return false;
      if (from && ts < from) return false;
      if (to   && ts > to)   return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest')   return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest')   return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'name-asc') return a.fullName.localeCompare(b.fullName);
      if (sortBy === 'name-desc')return b.fullName.localeCompare(a.fullName);
      return 0;
    });
  }, [users, searchTerm, roleFilter, statusFilter, ageGroup, dateFrom, dateTo, sortBy]);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#748DAE]" />
            <h3 className="text-lg font-semibold text-gray-900">
              User Management
            </h3>
            <span className="ml-1 text-sm text-gray-500">
              ({filteredUsers.length} of {users.length})
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#748DAE] focus:border-transparent text-sm w-56"
              />
            </div>

            {/* Toggle filter drawer */}
            <button
              onClick={() => setShowFilters((p) => !p)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                showFilters || activeFilterCount > 0
                  ? 'border-[#748DAE] bg-[#748DAE]/10 text-[#748DAE]'
                  : 'border-gray-300 text-gray-600 hover:border-[#748DAE] hover:text-[#748DAE]'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#748DAE] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Clear filters (visible when any filter is active) */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-3 py-2 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Collapsible filter drawer */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              key="filter-drawer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4 px-1 mb-4 border-t border-b border-gray-100">

                {/* Role */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <Users className="h-3.5 w-3.5" />
                    Role
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#748DAE] focus:border-transparent text-sm"
                  >
                    <option value="all">All Roles</option>
                    <option value="patient">Patient</option>
                    <option value="therapist">Therapist</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <UserCheck className="h-3.5 w-3.5" />
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#748DAE] focus:border-transparent text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Account age group */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <Calendar className="h-3.5 w-3.5" />
                    Account Age
                  </label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#748DAE] focus:border-transparent text-sm"
                  >
                    {AGE_GROUPS.map((g) => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#748DAE] focus:border-transparent text-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name-asc">Name A → Z</option>
                    <option value="name-desc">Name Z → A</option>
                  </select>
                </div>

                {/* Registration date — from */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Registered From
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    max={dateTo || undefined}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#748DAE] focus:border-transparent text-sm"
                  />
                </div>

                {/* Registration date — to */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Registered To
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    min={dateFrom || undefined}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#748DAE] focus:border-transparent text-sm"
                  />
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable Table */}
        <div className="overflow-x-auto">
          <div className="max-h-[520px] overflow-y-auto rounded-lg border border-gray-100">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    onClick={() => setSelectedUserId(user._id)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.fullName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'patient'
                            ? 'bg-blue-100 text-blue-800'
                            : user.role === 'therapist'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'supervisor'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
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
                          onClick={(e) => { e.stopPropagation(); onToggleActive(user._id); }}
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
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirm(user); }}
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

            {filteredUsers.length === 0 && (
              <div className="text-center py-16">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        </div>
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
                Are you sure you want to delete{' '}
                <strong>{deleteConfirm.fullName}</strong> ({deleteConfirm.email})?
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
                  onClick={() => onDelete(deleteConfirm._id)}
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

      {/* User Detail Panel */}
      <UserDetailPanel
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </>
  );
};
