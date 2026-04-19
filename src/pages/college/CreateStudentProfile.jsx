import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collegeService } from '../../api/college';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { User, Mail, Lock } from 'lucide-react';

export const CreateStudentProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    bio: '',
    sessionRate: '',
    supervisorLicenseNumber: '',
    specializations: [],
  });

  const [specializationInput, setSpecializationInput] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSpecialization = () => {
    if (specializationInput.trim() && !formData.specializations.includes(specializationInput.trim())) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, specializationInput.trim()]
      }));
      setSpecializationInput('');
    }
  };

  const handleRemoveSpecialization = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.fullName || !formData.email || !formData.password || !formData.supervisorLicenseNumber) {
        throw new Error('Please fill in all required fields');
      }

      await collegeService.createStudentProfile({
        ...formData,
        sessionRate: Number(formData.sessionRate) || 0,
      });

      alert('Student profile created successfully');
      navigate('/college/manage-students');
    } catch (err) {
      console.error('Error creating profile:', err);
      setError(err.response?.data?.message || err.message || Object.values(err.response?.data?.errors || {})[0] || 'Failed to create student profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#748DAE] to-[#9ECAD6] rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create Student Profile
            </h2>
            <p className="text-gray-600">
              Set up a new therapist intern profile for your affiliated students
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Info Section */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"><User className="h-5 w-5" /></span>
                    <Input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. John Doe"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"><Mail className="h-5 w-5" /></span>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="student@college.edu"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Initial Password *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"><Lock className="h-5 w-5" /></span>
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                      placeholder="Set an initial password"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Supervisor section */}
            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Supervisor's Professional License Number *
              </label>
              <Input
                type="text"
                name="supervisorLicenseNumber"
                value={formData.supervisorLicenseNumber}
                onChange={handleInputChange}
                required
                placeholder="e.g., 789456"
                className="bg-white"
              />
              <p className="text-xs text-gray-600 mt-2">
                ⚠️ <strong>Important:</strong> Enter your supervisor's <strong>Professional License Number</strong> (the number they entered when creating their profile). 
                Your supervisor can find this displayed on their dashboard.
              </p>
            </div>

            {/* Session Rate Section */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Session Rate (Rs)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10">Rs</span>
                    <Input
                      type="number"
                      name="sessionRate"
                      value={formData.sessionRate}
                      onChange={handleInputChange}
                      min="0"
                      step="1"
                      placeholder="e.g. 150"
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Specializations */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Specializations
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  type="text"
                  value={specializationInput}
                  onChange={(e) => setSpecializationInput(e.target.value)}
                  placeholder="e.g., Anxiety, Depression, CBT"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSpecialization();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddSpecialization}
                  variant="secondary"
                  className="whitespace-nowrap bg-[#748DAE] hover:bg-[#657B9D] text-white"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#9ECAD6] text-white rounded-full text-sm font-medium shadow-sm"
                  >
                    {spec}
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialization(index)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Professional Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#748DAE] focus:border-transparent transition-all"
                placeholder="Brief background about the student..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 space-x-4 border-t border-gray-100 mt-8">
              <Button
                type="button"
                onClick={() => navigate('/college/manage-students')}
                disabled={loading}
                variant="outline"
                className="px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="px-8 bg-[#9ECAD6] hover:bg-[#8BB9C5] text-white shadow-lg"
              >
                {loading ? 'Creating Profile...' : 'Create Student Profile'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
