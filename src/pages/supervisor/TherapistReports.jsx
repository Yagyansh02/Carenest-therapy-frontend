import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  ArrowLeft, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  Award,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { therapistService } from '../../api/therapist';
import { supervisorService } from '../../api/supervisor';
import { feedbackService } from '../../api/feedback';
import api from '../../api/axios';

export const TherapistReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [therapists, setTherapists] = useState([]);
  const [supervisorProfile, setSupervisorProfile] = useState(null);

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    try {
      setLoading(true);
      
      // Get supervisor profile first
      const profileResponse = await supervisorService.getMyProfile();
      const profile = profileResponse.data.data;
      setSupervisorProfile(profile);

      // Fetch all therapists
      const therapistsResponse = await therapistService.getAllTherapists(1, 1000);
      const allTherapists = therapistsResponse.data.data.therapists || [];
      
      // Filter therapists supervised by this supervisor
      const myTherapists = allTherapists.filter(t => {
        if (!t.supervisorId) return false;
        const therapistSupervisorId = typeof t.supervisorId === 'object' ? t.supervisorId?._id : t.supervisorId;
        return therapistSupervisorId === profile._id;
      });

      console.log('Therapists with ratings:', myTherapists.map(t => ({ 
        name: t.userId?.fullName, 
        rating: t.averageRating,
        experience: t.yearsOfExperience 
      })));

      // Fetch actual ratings from feedback stats for therapists with 0 rating
      const therapistsWithRatings = await Promise.all(
        myTherapists.map(async (therapist) => {
          if (therapist.averageRating === 0 && therapist.userId?._id) {
            try {
              const statsResponse = await api.get(`/feedbacks/stats/${therapist.userId._id}`);
              const stats = statsResponse.data.data;
              return {
                ...therapist,
                averageRating: stats.averageRating || 0,
                totalFeedbacks: stats.totalReceived || 0
              };
            } catch (error) {
              console.error('Error fetching stats for therapist:', therapist.userId?.fullName, error);
              return therapist;
            }
          }
          return therapist;
        })
      );

      console.log('Therapists with updated ratings:', therapistsWithRatings.map(t => ({ 
        name: t.userId?.fullName, 
        rating: t.averageRating 
      })));

      setTherapists(therapistsWithRatings);
    } catch (error) {
      console.error('Error fetching therapists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTherapistClick = (therapistId) => {
    navigate(`/supervisor/therapist-report/${therapistId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#748DAE] mx-auto mb-4" />
          <p className="text-gray-600">Loading therapists...</p>
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
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[#748DAE] hover:text-[#657B9D] mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Therapist Progress Reports
          </h1>
          <p className="text-gray-600">
            View detailed session reports and feedback for therapists under your supervision
          </p>
        </motion.div>

        {/* Therapists Grid */}
        {therapists.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100"
          >
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Therapists Found
            </h3>
            <p className="text-gray-600">
              You don't have any therapists under your supervision yet.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {therapists.map((therapist, index) => (
              <motion.div
                key={therapist._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleTherapistClick(therapist._id)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Therapist Avatar */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#9ECAD6] to-[#748DAE] rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#748DAE] transition-colors">
                        {therapist.userId?.fullName || 'Unknown'}
                      </h3>
                      <p className="text-sm text-gray-600">{therapist.userId?.email}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#748DAE] transition-colors" />
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    therapist.verificationStatus === 'verified' 
                      ? 'bg-green-100 text-green-800' 
                      : therapist.verificationStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {therapist.verificationStatus}
                  </span>
                  {therapist.isStudent && (
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                      Student
                    </span>
                  )}
                </div>

                {/* Specializations */}
                {therapist.specializations && therapist.specializations.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {therapist.specializations.slice(0, 2).map((spec, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {spec}
                        </span>
                      ))}
                      {therapist.specializations.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          +{therapist.specializations.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
