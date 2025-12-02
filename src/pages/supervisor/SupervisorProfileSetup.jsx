import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supervisorService } from '../../api/supervisor';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { motion } from 'framer-motion';
import { Award, ArrowRight } from 'lucide-react';

export const SupervisorProfileSetup = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    professionalLicenseNumber: '',
  });

  // Check if profile already exists on mount
  useEffect(() => {
    const checkExistingProfile = async () => {
      try {
        await supervisorService.getMyProfile();
        // If profile exists, redirect to dashboard
        navigate('/dashboard');
      } catch (err) {
        // Profile doesn't exist, continue with setup
        setCheckingProfile(false);
      }
    };
    checkExistingProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.professionalLicenseNumber.trim()) {
      setError('Professional license number is required');
      return;
    }

    try {
      setLoading(true);
      const response = await supervisorService.createProfile(formData);
      
      console.log('Profile created:', response.data);
      
      // Small delay to ensure database commit
      await new Promise(resolve => setTimeout(resolve, 500));
      
      alert('Supervisor profile created successfully!');
      // Use window.location for hard redirect to ensure fresh data fetch
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Profile creation error:', err);
      setError(err.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking existing profile
  if (checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Checking profile status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Complete Your Supervisor Profile
          </h1>
          <p className="text-secondary-600">
            Set up your profile to start supervising student therapists
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Professional License Number */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-secondary-700 mb-2">
                  <Award className="h-4 w-4 text-primary-600" />
                  Professional License Number *
                </label>
                <Input
                  type="text"
                  name="professionalLicenseNumber"
                  value={formData.professionalLicenseNumber}
                  onChange={handleChange}
                  placeholder="Enter your professional license number"
                  required
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Your unique professional license number for verification
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Important Information</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Your license number will be used to verify your credentials</li>
                  <li>• Student therapists will use your Supervisor Profile ID to link to you</li>
                  <li>• You can manage and verify your supervised students from your dashboard</li>
                </ul>
              </div>

              {/* Supervisor ID Display */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <h3 className="font-medium text-primary-900 mb-2">After Profile Creation</h3>
                <p className="text-sm text-primary-700">
                  Once you create your profile, you'll receive a <strong>Supervisor Profile ID</strong> that 
                  student therapists can use when they complete their profiles to link themselves to you.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      Create Profile
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
