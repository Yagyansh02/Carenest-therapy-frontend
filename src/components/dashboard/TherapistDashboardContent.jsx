import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Award,
  Briefcase,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit
} from 'lucide-react';
import { therapistService } from '../../api/therapist';

export const TherapistDashboardContent = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTherapistProfile();
  }, []);

  const fetchTherapistProfile = async () => {
    try {
      setLoading(true);
      const response = await therapistService.getMyProfile();
      setProfile(response.data.data);
    } catch (err) {
      // Only set error state if it's NOT a 404 (profile not found)
      // If it is 404, we want to show the "Complete Profile" UI which checks !profile
      if (err.statusCode === 404 || err.response?.status === 404) {
        setProfile(null);
        // Automatically redirect to setup profile page if profile is missing
        navigate('/therapist/setup-profile');
      } else {
        console.error('Error fetching therapist profile:', err);
        setError(err.message || err.response?.data?.message || 'Failed to load profile');
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
              Error Loading Profile
            </h3>
            <p className="text-red-800 mb-4">{error}</p>
            <button
              onClick={fetchTherapistProfile}
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

  const stats = [
    { label: 'Today\'s Sessions', value: '8', icon: Calendar, color: 'bg-[#9ECAD6]' },
    { label: 'Active Patients', value: '24', icon: User, color: 'bg-[#748DAE]' },
    { label: 'Pending Assessments', value: '6', icon: FileText, color: 'bg-[#F5CBCB]' },
    { label: 'Messages', value: '12', icon: MessageSquare, color: 'bg-[#9ECAD6]' },
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
        {stats.map((stat, index) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Professional Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-[#748DAE]" />
            Professional Information
          </h3>
          
          <div className="space-y-4">
            {/* Bio */}
            {profile?.bio && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">About</p>
                <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* License Number */}
            {profile?.licenseNumber && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">License Number</p>
                <p className="text-gray-600">{profile.licenseNumber}</p>
              </div>
            )}

            {/* Specializations */}
            {profile?.specializations && profile.specializations.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Specializations</p>
                <div className="flex flex-wrap gap-2">
                  {profile.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#9ECAD6]/20 text-[#748DAE] rounded-full text-sm font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Qualifications */}
            {profile?.qualifications && profile.qualifications.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Qualifications
                </p>
                <div className="space-y-2">
                  {profile.qualifications.map((qual, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{qual.degree}</p>
                      <p className="text-sm text-gray-600">{qual.institution}</p>
                      {qual.year && (
                        <p className="text-xs text-gray-500 mt-1">{qual.year}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supervisor */}
            {profile?.isStudent && profile?.supervisorId && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Supervisor</p>
                <p className="text-gray-600">
                  {profile.supervisorId.fullName || profile.supervisorId.email}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Today's Schedule & Quick Actions */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Today's Schedule</h3>
            <div className="space-y-3">
              {[
                { patient: 'John Doe', time: '9:00 AM', type: 'Initial Consultation' },
                { patient: 'Jane Smith', time: '10:30 AM', type: 'Follow-up Session' },
                { patient: 'Robert Brown', time: '2:00 PM', type: 'Group Therapy' },
              ].map((session, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{session.patient}</p>
                      <p className="text-xs text-[#748DAE] mt-1">{session.type}</p>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{session.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full p-3 text-left bg-[#9ECAD6] hover:bg-[#8BB9C5] text-white rounded-lg transition-colors flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">View All Patients</span>
              </button>
              <button className="w-full p-3 text-left bg-[#748DAE] hover:bg-[#657B9D] text-white rounded-lg transition-colors flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Review Assessments</span>
              </button>
              <button className="w-full p-3 text-left bg-[#F5CBCB] hover:bg-[#E4BABA] text-white rounded-lg transition-colors flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">Session Notes</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
