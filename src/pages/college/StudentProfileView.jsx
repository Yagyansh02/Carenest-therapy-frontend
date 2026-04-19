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
  Building2
} from 'lucide-react';

export const StudentProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudentProfile();
  }, [id]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const response = await therapistService.getTherapistById(id);
      setStudent(response.data.data);
    } catch (error) {
      console.error('Failed to fetch student profile', error);
      setError('Failed to load student profile. Please try again later.');
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

  if (error || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 pt-20">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Student not found'}</p>
          <Button onClick={() => navigate('/college/manage-students')}>
            Back to Manage Students
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
          onClick={() => navigate('/college/manage-students')}
          className="flex items-center gap-2 text-secondary-600 hover:text-secondary-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Manage Students
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
                  {student.userId?.fullName?.charAt(0) || 'S'}
                </span>
              </div>

              {/* Basic Info */}
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h1 className="text-3xl font-bold text-secondary-900">
                    {student.userId?.fullName || 'Student'}
                  </h1>
                  {student.verificationStatus === 'verified' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      <CheckCircle className="h-4 w-4" />
                      Verified
                    </span>
                  ) : student.verificationStatus === 'pending' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                      <Clock className="h-4 w-4" />
                      Pending Verification
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                      Rejected
                    </span>
                  )}
                  {student.isStudent && (
                     <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                     Intern Student
                   </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-secondary-600 mt-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary-600" />
                    <span>{student.userId?.email}</span>
                  </div>
                  {student.userId?.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-primary-600" />
                      <span>{student.userId?.phoneNumber}</span>
                    </div>
                  )}
                  {student.supervisorId && (
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary-600" />
                      <span>Supervisor: {student.supervisorId?.userId?.fullName || student.supervisorId?.fullName || student.supervisorId?.email || 'Assigned'}</span>
                    </div>
                  )}
                  {student.collegeId && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary-600" />
                      <span>College: {student.collegeId?.institutionName || 'Assigned'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Bio Section */}
        {student.bio && (
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
              <p className="text-secondary-600 leading-relaxed">{student.bio}</p>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Specializations */}
          {student.specializations && student.specializations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-secondary-900">Focus Areas</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.specializations.map((spec, idx) => (
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
          {student.qualifications && student.qualifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-secondary-900">Education Context</h2>
                </div>
                <div className="space-y-3">
                  {student.qualifications.map((qual, idx) => (
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

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <p className="text-2xl font-bold text-primary-700">
                  {student.totalSessions || 0}
                </p>
                <p className="text-sm text-secondary-600 mt-1">Total Sessions</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">
                  {student.averageRating ? student.averageRating.toFixed(1) : 'N/A'}
                </p>
                <p className="text-sm text-secondary-600 mt-1">Average Rating</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">
                  {student.totalPatients || 0}
                </p>
                <p className="text-sm text-secondary-600 mt-1">Total Patients Assessed</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};