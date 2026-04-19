import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { therapistService } from '../../api/therapist';
import { collegeService } from '../../api/college';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, User, Mail, Award, Calendar, Building2, Search, Plus, Trash2 } from 'lucide-react';

export const ManageStudents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [allTherapists, setAllTherapists] = useState([]);
  const [collegeProfile, setCollegeProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [addingId, setAddingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get college profile
      const profileResponse = await collegeService.getMyProfile();
      const profile = profileResponse.data.data;
      setCollegeProfile(profile);

      // Fetch all therapists (student interns)
      const response = await therapistService.getAllTherapists(1, 1000);
      const therapists = response.data.data?.therapists || [];

      // Filter to only student therapists (isStudent = true)
      const studentTherapists = therapists.filter((t) => t.isStudent === true);

      setAllTherapists(studentTherapists);
    } catch (error) {
      console.error('Failed to fetch data', error);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (studentUserId) => {
    try {
      setAddingId(studentUserId);
      await collegeService.addStudent(studentUserId);
      await fetchData(); // Refresh data
      alert('Student added to college successfully!');
    } catch (error) {
      console.error('Failed to add student', error);
      alert(error.response?.data?.message || 'Failed to add student');
    } finally {
      setAddingId(null);
    }
  };

  const handleRemoveStudent = async (studentUserId) => {
    try {
      setRemovingId(studentUserId);
      await collegeService.removeStudent(studentUserId);
      await fetchData(); // Refresh data
      alert('Student removed from college successfully!');
    } catch (error) {
      console.error('Failed to remove student', error);
      alert(error.response?.data?.message || 'Failed to remove student');
    } finally {
      setRemovingId(null);
    }
  };

  const affiliatedStudentIds = collegeProfile?.affiliatedStudents?.map(
    (s) => s._id?.toString() || s.toString()
  ) || [];

  const affiliatedStudents = allTherapists.filter((t) =>
    affiliatedStudentIds.includes(t.userId?._id?.toString() || t.userId?.toString())
  );

  const unaffiliatedStudents = allTherapists.filter(
    (t) => !affiliatedStudentIds.includes(t.userId?._id?.toString() || t.userId?.toString())
  );

  const filteredUnaffiliated = unaffiliatedStudents.filter((t) => {
    if (!searchTerm) return true;
    const name = t.userId?.fullName || '';
    const email = t.userId?.email || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 pt-20">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
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
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-8 w-8 text-[#748DAE]" />
            <h1 className="text-3xl font-bold text-gray-900">Manage Students</h1>
          </div>
          <p className="text-gray-600">
            {collegeProfile?.institutionName} — Manage your affiliated intern students
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <p className="text-gray-600 text-sm">Total Student Interns</p>
            <p className="text-3xl font-bold text-gray-900">{affiliatedStudents.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <p className="text-gray-600 text-sm">Verified Interns</p>
            <p className="text-3xl font-bold text-green-600">{affiliatedStudents.filter(t => t.verificationStatus === 'verified').length}</p>
          </motion.div>
        </div>

        {/* Affiliated Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Affiliated Students ({affiliatedStudents.length})
          </h2>
          {affiliatedStudents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No students affiliated yet. Add students from the list below.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {affiliatedStudents.map((therapist) => (
                <div
                  key={therapist._id}
                  className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer hover:border-primary-300"
                    onClick={() => navigate('/college/student/' + therapist._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {therapist.userId?.fullName || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">{therapist.userId?.email}</p>
                      </div>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveStudent(therapist.userId?._id); }}
                      disabled={removingId === therapist.userId?._id}
                      className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                      title="Remove from college"
                    >
                      {removingId === therapist.userId?._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {therapist.specializations?.slice(0, 2).map((spec, i) => (
                      <span key={i} className="text-xs bg-[#9ECAD6]/20 text-[#748DAE] px-2 py-1 rounded-full">
                        {spec}
                      </span>
                    ))}
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        therapist.verificationStatus === 'verified'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {therapist.verificationStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};



