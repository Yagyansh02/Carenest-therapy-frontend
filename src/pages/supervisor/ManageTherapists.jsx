import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { therapistService } from '../../api/therapist';
import { supervisorService } from '../../api/supervisor';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, User, Mail, Award, Calendar, Clock } from 'lucide-react';

export const ManageTherapists = () => {
  const { user } = useAuth();
  const [therapists, setTherapists] = useState([]);
  const [supervisorProfile, setSupervisorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, verified, pending
  const [verifyingId, setVerifyingId] = useState(null);

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    try {
      setLoading(true);
      
      // First, get supervisor profile to know their ID
      const profileResponse = await supervisorService.getMyProfile();
      const profile = profileResponse.data.data;
      setSupervisorProfile(profile);
      
      // Then fetch all therapists
      const response = await therapistService.getAllTherapists(1, 1000);
      const allTherapists = response.data.data?.therapists || [];
      
      // Filter to only show therapists supervised by THIS supervisor
      const myTherapists = allTherapists.filter(t => 
        t.supervisorId?._id === profile._id || t.supervisorId === profile._id
      );
      
      setTherapists(myTherapists);
    } catch (error) {
      console.error('Failed to fetch therapists', error);
      setError('Failed to load therapists. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTherapist = async (therapistId) => {
    try {
      setVerifyingId(therapistId);
      await therapistService.verifyTherapist(therapistId);
      
      // Update local state
      setTherapists(therapists.map(t => 
        t._id === therapistId ? { ...t, verificationStatus: 'verified' } : t
      ));
      
      alert('Therapist verified successfully!');
    } catch (error) {
      console.error('Failed to verify therapist', error);
      alert(error.response?.data?.message || 'Failed to verify therapist');
    } finally {
      setVerifyingId(null);
    }
  };

  const getFilteredTherapists = () => {
    switch (filter) {
      case 'verified':
        return therapists.filter(t => t.verificationStatus === 'verified');
      case 'pending':
        return therapists.filter(t => t.verificationStatus === 'pending');
      default:
        return therapists;
    }
  };

  const filteredTherapists = getFilteredTherapists();
  const pendingCount = therapists.filter(t => t.verificationStatus === 'pending').length;
  const verifiedCount = therapists.filter(t => t.verificationStatus === 'verified').length;

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Manage Therapists
          </h1>
          <p className="text-secondary-600">
            Review and verify therapist profiles
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-600">Total Therapists</p>
                  <p className="text-2xl font-bold text-secondary-900">{therapists.length}</p>
                </div>
                <User className="h-8 w-8 text-primary-600" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-600">Verified</p>
                  <p className="text-2xl font-bold text-green-600">{verifiedCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-600">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-secondary-600 hover:bg-secondary-50'
            }`}
          >
            All ({therapists.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'pending'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-secondary-600 hover:bg-secondary-50'
            }`}
          >
            Pending Review ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'verified'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-secondary-600 hover:bg-secondary-50'
            }`}
          >
            Verified ({verifiedCount})
          </button>
        </div>

        {/* Therapists List */}
        {filteredTherapists.length === 0 ? (
          <Card className="p-12 text-center">
            <User className="h-16 w-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">No therapists found</h3>
            <p className="text-secondary-600">
              {filter === 'pending' 
                ? 'No therapists pending verification.' 
                : filter === 'verified'
                ? 'No verified therapists yet.'
                : 'No therapists in the system.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTherapists.map((therapist, index) => (
              <motion.div
                key={therapist._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Avatar & Basic Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-primary-700">
                          {therapist.userId?.fullName?.charAt(0) || 'T'}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-secondary-900">
                            {therapist.userId?.fullName || 'Therapist'}
                          </h3>
                          {therapist.verificationStatus === 'verified' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              <CheckCircle className="h-3 w-3" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                              <Clock className="h-3 w-3" />
                              Pending Verification
                            </span>
                          )}
                          {therapist.isStudentTherapist && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              Student Therapist
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 text-sm text-secondary-600">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{therapist.userId?.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            <span>License: {therapist.licenseNumber || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{therapist.yearsOfExperience || 0} years experience</span>
                          </div>
                        </div>

                        {therapist.specializations && therapist.specializations.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {therapist.specializations.slice(0, 3).map((spec, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded"
                              >
                                {spec}
                              </span>
                            ))}
                            {therapist.specializations.length > 3 && (
                              <span className="px-2 py-1 bg-secondary-100 text-secondary-600 text-xs rounded">
                                +{therapist.specializations.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:w-48">
                      {therapist.verificationStatus !== 'verified' && (
                        <Button
                          onClick={() => handleVerifyTherapist(therapist._id)}
                          disabled={verifyingId === therapist._id}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {verifyingId === therapist._id ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Verifying...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Verify Therapist
                            </span>
                          )}
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => window.location.href = `/supervisor/therapist/${therapist._id}`}
                        variant="outline"
                        className="w-full"
                      >
                        View Full Profile
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
