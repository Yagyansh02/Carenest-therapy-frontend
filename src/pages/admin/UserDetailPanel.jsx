import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Briefcase,
  BookOpen,
  Users,
  DollarSign,
  Activity,
  ShieldCheck,
  Hourglass,
  Loader2,
  AlertTriangle,
  TrendingUp,
  FileText,
  ChevronRight,
  GraduationCap,
  Building2,
  Phone,
  Globe,
  Hash,
  UserSquare2,
} from 'lucide-react';
import { userService } from '../../api/user';

// ─── small helpers ────────────────────────────────────────────────────────────
const fmt = (date) =>
  date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const StatusBadge = ({ status }) => {
  const map = {
    completed: { cls: 'bg-green-100 text-green-700', label: 'Completed' },
    confirmed: { cls: 'bg-blue-100 text-blue-700', label: 'Confirmed' },
    pending:   { cls: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
    cancelled: { cls: 'bg-red-100 text-red-700', label: 'Cancelled' },
    rejected:  { cls: 'bg-red-100 text-red-700', label: 'Rejected' },
    'no-show': { cls: 'bg-gray-100 text-gray-600', label: 'No-show' },
    scheduled: { cls: 'bg-purple-100 text-purple-700', label: 'Scheduled' },
  };
  const { cls, label } = map[status] ?? { cls: 'bg-gray-100 text-gray-600', label: status };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
};

const SectionTitle = ({ children }) => (
  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{children}</h4>
);

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
    <div className="mt-0.5 p-1.5 bg-gray-100 rounded-md">
      <Icon className="h-3.5 w-3.5 text-gray-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800 break-words">{value ?? '—'}</p>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value, color = 'text-[#748DAE]', bg = 'bg-blue-50' }) => (
  <div className={`${bg} rounded-xl p-4 flex gap-3 items-center`}>
    <div className="p-2 bg-white rounded-lg shadow-sm">
      <Icon className={`h-4 w-4 ${color}`} />
    </div>
    <div>
      <p className="text-lg font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </div>
);

// ─── Patient detail view ──────────────────────────────────────────────────────
const PatientDetail = ({ data }) => {
  const { user, patientProfile, sessions, stats } = data;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Calendar}    label="Total Sessions"     value={stats.totalSessions}     bg="bg-blue-50"   color="text-blue-500" />
        <StatCard icon={CheckCircle} label="Completed"          value={stats.completedSessions} bg="bg-green-50"  color="text-green-600" />
        <StatCard icon={Hourglass}   label="Pending/Upcoming"   value={stats.pendingSessions}   bg="bg-yellow-50" color="text-yellow-600" />
        <StatCard icon={XCircle}     label="Cancelled"          value={stats.cancelledSessions} bg="bg-red-50"    color="text-red-500" />
      </div>

      {/* Patient profile */}
      {patientProfile && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <SectionTitle>Patient Profile</SectionTitle>
          <InfoRow icon={Calendar} label="Date of Birth" value={fmt(patientProfile.dateOfBirth)} />
          <InfoRow
            icon={TrendingUp}
            label="Progress Records"
            value={`${patientProfile.progressRecords?.length ?? 0} record${patientProfile.progressRecords?.length !== 1 ? 's' : ''}`}
          />
        </div>
      )}

      {/* Session history */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <SectionTitle>Session History</SectionTitle>
        {sessions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No sessions yet</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {sessions.map((s) => (
              <div key={s._id} className="flex items-center justify-between gap-2 p-3 rounded-lg border border-gray-50 hover:bg-gray-50 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {s.therapistId?.fullName ?? 'Unknown Therapist'}
                  </p>
                  <p className="text-xs text-gray-400">{fmt(s.scheduledAt)} · {s.duration} min</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={s.status} />
                  {s.sessionFee != null && (
                    <span className="text-xs text-gray-500">₹{s.sessionFee}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Therapist detail view ────────────────────────────────────────────────────
const TherapistDetail = ({ data }) => {
  const { therapistProfile: tp, sessions, uniquePatients, stats } = data;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Users}       label="Total Patients"    value={stats.totalPatients}     bg="bg-blue-50"   color="text-blue-500" />
        <StatCard icon={CheckCircle} label="Completed"         value={stats.completedSessions} bg="bg-green-50"  color="text-green-600" />
        <StatCard icon={DollarSign}  label="Total Revenue"     value={`₹${stats.totalRevenue.toLocaleString()}`} bg="bg-yellow-50" color="text-yellow-600" />
        <StatCard icon={Calendar}    label="Total Sessions"    value={stats.totalSessions}     bg="bg-purple-50" color="text-purple-600" />
      </div>

      {/* Therapist profile */}
      {tp && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
          <SectionTitle>Therapist Profile</SectionTitle>

          {tp.bio && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><FileText className="h-3 w-3" /> Bio</p>
              <p className="text-sm text-gray-700 leading-relaxed">{tp.bio}</p>
            </div>
          )}

          <InfoRow icon={Briefcase}  label="Years of Experience"   value={tp.yearsOfExperience ?? 0} />
          <InfoRow icon={DollarSign} label="Session Rate"           value={tp.sessionRate ? `₹${tp.sessionRate}` : null} />
          <InfoRow
            icon={ShieldCheck}
            label="Verification Status"
            value={
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                tp.verificationStatus === 'verified'  ? 'bg-green-100 text-green-700' :
                tp.verificationStatus === 'pending'   ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {tp.verificationStatus}
              </span>
            }
          />
          <InfoRow icon={BookOpen}   label="License Number"         value={tp.licenseNumber} />
          <InfoRow icon={Activity}   label="Student Therapist"      value={tp.isStudent ? 'Yes' : 'No'} />

          {tp.averageRating > 0 && (
            <InfoRow
              icon={Star}
              label="Average Rating"
              value={
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                  {tp.averageRating.toFixed(1)} / 5
                </span>
              }
            />
          )}

          {/* Specializations */}
          {tp.specializations?.length > 0 && (
            <div className="pt-1">
              <p className="text-xs text-gray-400 mb-2">Specializations</p>
              <div className="flex flex-wrap gap-1.5">
                {tp.specializations.map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-[#EBF3F6] text-[#748DAE] text-xs rounded-full font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Qualifications */}
          {tp.qualifications?.length > 0 && (
            <div className="pt-1">
              <p className="text-xs text-gray-400 mb-2">Qualifications</p>
              <div className="space-y-1">
                {tp.qualifications.map((q, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <ChevronRight className="h-3 w-3 text-gray-400 shrink-0" />
                    <span className="font-medium">{q.degree}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-500">{q.institution}</span>
                    {q.year && <span className="text-gray-400 ml-auto text-xs">{q.year}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Patient list */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <SectionTitle>Patients ({uniquePatients.length})</SectionTitle>
        {uniquePatients.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No patients yet</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {uniquePatients.map((p) => (
              <div key={p._id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-50 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#EBF3F6] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#748DAE]">
                    {p.fullName?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.fullName}</p>
                  <p className="text-xs text-gray-400 truncate">{p.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent sessions */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <SectionTitle>Recent Sessions</SectionTitle>
        {sessions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No sessions yet</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {sessions.slice(0, 20).map((s) => (
              <div key={s._id} className="flex items-center justify-between gap-2 p-3 rounded-lg border border-gray-50 hover:bg-gray-50 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {s.patientId?.fullName ?? 'Unknown Patient'}
                  </p>
                  <p className="text-xs text-gray-400">{fmt(s.scheduledAt)} · {s.duration} min</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={s.status} />
                  {s.sessionFee != null && (
                    <span className="text-xs text-gray-500">₹{s.sessionFee}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
// ─── College detail view ─────────────────────────────────────────────────────────────
const CollegeDetail = ({ data }) => {
  const { collegeProfile: cp } = data;

  if (!cp) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <SectionTitle>College Profile</SectionTitle>
        <p className="text-sm text-gray-400 text-center py-6">No college profile set up yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Users}         label="Affiliated Students" value={cp.affiliatedStudents?.length ?? 0} bg="bg-blue-50"   color="text-blue-500" />
        <StatCard icon={ShieldCheck}   label="Verification"        value={cp.verificationStatus}              bg={cp.verificationStatus === 'verified' ? 'bg-green-50' : cp.verificationStatus === 'rejected' ? 'bg-red-50' : 'bg-yellow-50'} color={cp.verificationStatus === 'verified' ? 'text-green-600' : cp.verificationStatus === 'rejected' ? 'text-red-500' : 'text-yellow-600'} />
      </div>

      {/* Institution info */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <SectionTitle>Institution Details</SectionTitle>
        <InfoRow icon={Building2}    label="Institution Name"     value={cp.institutionName} />
        <InfoRow icon={Hash}         label="Affiliation Number"   value={cp.affiliationNumber} />
        <InfoRow icon={BookOpen}     label="Department"           value={cp.department || null} />
        <InfoRow icon={Globe}        label="Website"              value={cp.website || null} />
        <InfoRow icon={User}         label="Address"              value={cp.address || null} />
      </div>

      {/* Contact person */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <SectionTitle>Contact Person</SectionTitle>
        <InfoRow icon={UserSquare2}  label="Name"   value={cp.contactPersonName || null} />
        <InfoRow icon={Mail}         label="Email"  value={cp.contactPersonEmail || null} />
        <InfoRow icon={Phone}        label="Phone"  value={cp.contactPhone || null} />
      </div>

      {/* Agreement period */}
      {(cp.agreementStartDate || cp.agreementEndDate) && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <SectionTitle>Agreement Period</SectionTitle>
          <InfoRow icon={Calendar} label="Start Date" value={fmt(cp.agreementStartDate)} />
          <InfoRow icon={Calendar} label="End Date"   value={fmt(cp.agreementEndDate)} />
        </div>
      )}

      {/* Affiliated students */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <SectionTitle>Affiliated Students ({cp.affiliatedStudents?.length ?? 0})</SectionTitle>
        {!cp.affiliatedStudents?.length ? (
          <p className="text-sm text-gray-400 text-center py-6">No affiliated students yet</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {cp.affiliatedStudents.map((s) => (
              <div key={s._id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-50 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#EBF3F6] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#748DAE]">
                    {s.fullName?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{s.fullName}</p>
                  <p className="text-xs text-gray-400 truncate">{s.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
// ─── Generic supervisor / admin view ─────────────────────────────────────────
const GenericDetail = ({ data }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
    <SectionTitle>Account Details</SectionTitle>
    <InfoRow icon={User}     label="Role"    value={data.user.role} />
    <InfoRow icon={Calendar} label="Joined"  value={fmt(data.user.createdAt)} />
  </div>
);

// ─── Main panel component ─────────────────────────────────────────────────────
export const UserDetailPanel = ({ userId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [data, setData]       = useState(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await userService.getUserDetail(userId);
        if (!cancelled) setData(res.data.data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load user details');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [userId]);

  const role = data?.user?.role;

  return (
    <AnimatePresence>
      {userId && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Slide-over panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-50 z-50 flex flex-col shadow-2xl"
          >
            {/* Header – always visible */}
            {loading || error ? (
              <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
                <p className="font-semibold text-gray-800">User Details</p>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            ) : (
              <div className="px-5 pt-5 pb-4 bg-white border-b border-gray-100">
                <div className="flex items-start justify-between gap-3">
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#EBF3F6] flex items-center justify-center shrink-0">
                      <span className="text-lg font-bold text-[#748DAE]">
                        {data?.user?.fullName?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{data?.user?.fullName}</p>
                      <p className="text-xs text-gray-500">{data?.user?.email}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          role === 'patient'    ? 'bg-blue-100 text-blue-700' :
                          role === 'therapist'  ? 'bg-purple-100 text-purple-700' :
                          role === 'supervisor' ? 'bg-green-100 text-green-700' :
                          role === 'college'    ? 'bg-teal-100 text-teal-700' :
                          'bg-red-100 text-red-700'
                        }`}>{role}</span>
                        {data?.user?.isActive ? (
                          <span className="flex items-center gap-0.5 text-xs text-green-600">
                            <CheckCircle className="h-3 w-3" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-xs text-red-500">
                            <XCircle className="h-3 w-3" /> Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0">
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Common info row */}
                <div className="mt-3 flex gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {data?.user?.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Joined {fmt(data?.user?.createdAt)}
                  </span>
                </div>
              </div>
            )}

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-5">
              {loading && (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-[#748DAE]" />
                  <p className="text-sm text-gray-500">Loading user details…</p>
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                  <p className="text-sm text-gray-600">{error}</p>
                  <button
                    onClick={() => userService.getUserDetail(userId)}
                    className="text-xs text-[#748DAE] underline"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loading && !error && data && (
                <>
                  {role === 'patient'   && <PatientDetail   data={data} />}
                  {role === 'therapist' && <TherapistDetail data={data} />}
                  {role === 'college'   && <CollegeDetail   data={data} />}
                  {!['patient', 'therapist', 'college'].includes(role) && <GenericDetail data={data} />}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
