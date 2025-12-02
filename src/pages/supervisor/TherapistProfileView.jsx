import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { therapistService } from '../../api/therapist';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Award, 
  Calendar, 
  Clock, 
  DollarSign,
  CheckCircle,
  FileText,
  Briefcase,
  MapPin
} from 'lucide-react';

export const TherapistProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTherapistProfile();
  }, [id]);

  const fetchTherapistProfile = async () => {
    try {
      setLoading(true);
      const response = await therapistService.getTherapistById(id);
      setTherapist(response.data.data);
    } catch (error) {
      console.error('Failed to fetch therapist profile', error);
      setError('Failed to load therapist profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !therapist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 pt-20">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Therapist not found'}</p>
          <Button onClick={() => navigate('/supervisor/manage-therapists')}>
            Back to Manage Therapists
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/supervisor/manage-therapists')}
          className="flex items-center gap-2 text-secondary-600 hover:text-secondary-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Manage Therapists
        </motion.button>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 mb-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className="h-32 w-32 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-5xl font-bold text-primary-700">
                  {therapist.userId?.fullName?.charAt(0) || 'T'}
                </span>
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-secondary-900">
                    {therapist.userId?.fullName || 'Therapist'}
                  </h1>
                  {therapist.verificationStatus === 'verified' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      <CheckCircle className="h-4 w-4" />
                      Verified
                    </span>
                  ) : therapist.verificationStatus === 'pending' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                      <Clock className="h-4 w-4" />
                      Pending Verification
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                      Rejected
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-secondary-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary-600" />
                    <span>{therapist.userId?.email}</span>
                  </div>
                  {therapist.userId?.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-primary-600" />
                      <span>{therapist.userId?.phoneNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary-600" />
                    <span>License: {therapist.licenseNumber || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary-600" />
                    <span>{therapist.yearsOfExperience || 0} years experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary-600" />
                    <span>₹{therapist.sessionRate || 0}/session</span>
                  </div>
                  {therapist.isStudent && therapist.supervisorId && (
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary-600" />
                      <span>Supervisor: {therapist.supervisorId?.fullName || 'N/A'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Bio Section */}
        {therapist.bio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-semibold text-secondary-900">About</h2>
              </div>
              <p className="text-secondary-600 leading-relaxed">{therapist.bio}</p>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Specializations */}
          {therapist.specializations && therapist.specializations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-secondary-900">Specializations</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {therapist.specializations.map((spec, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Qualifications */}
          {therapist.qualifications && therapist.qualifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-secondary-900">Qualifications</h2>
                </div>
                <div className="space-y-3">
                  {therapist.qualifications.map((qual, idx) => (
                    <div key={idx} className="border-l-2 border-primary-600 pl-3">
                      <p className="font-medium text-secondary-900">{qual.degree}</p>
                      <p className="text-sm text-secondary-600">{qual.institution}</p>
                      {qual.year && (
                        <p className="text-xs text-secondary-500">{qual.year}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Availability */}
        {therapist.availability && Object.keys(therapist.availability).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-semibold text-secondary-900">Availability</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(therapist.availability).map(([day, slots]) => (
                  <div key={day} className="bg-secondary-50 rounded-lg p-4">
                    <h3 className="font-semibold text-secondary-900 capitalize mb-2">
                      {day}
                    </h3>
                    {Array.isArray(slots) && slots.length > 0 ? (
                      <div className="space-y-1">
                        {slots.map((slot, idx) => (
                          <p key={idx} className="text-sm text-secondary-600">
                            {slot.start} - {slot.end}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-secondary-500">Not available</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <p className="text-2xl font-bold text-primary-700">
                  {therapist.totalSessions || 0}
                </p>
                <p className="text-sm text-secondary-600 mt-1">Total Sessions</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">
                  {therapist.averageRating ? therapist.averageRating.toFixed(1) : 'N/A'}
                </p>
                <p className="text-sm text-secondary-600 mt-1">Average Rating</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">
                  {therapist.totalPatients || 0}
                </p>
                <p className="text-sm text-secondary-600 mt-1">Total Patients</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-700">
                  {therapist.yearsOfExperience || 0}
                </p>
                <p className="text-sm text-secondary-600 mt-1">Years Experience</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
