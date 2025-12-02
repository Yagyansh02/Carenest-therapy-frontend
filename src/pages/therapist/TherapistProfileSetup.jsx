import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { therapistService } from '../../api/therapist';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const TherapistProfileSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    bio: '',
    isStudent: false,
    licenseNumber: '',
    specializations: [],
    yearsOfExperience: 0,
    sessionRate: '',
    qualifications: [],
    availability: {},
    supervisorId: '',
  });

  const [specializationInput, setSpecializationInput] = useState('');
  const [qualificationInput, setQualificationInput] = useState({
    degree: '',
    institution: '',
    year: '',
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddSpecialization = () => {
    if (specializationInput.trim()) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, specializationInput.trim()]
      }));
      setSpecializationInput('');
    }
  };

  const handleRemoveSpecialization = (index) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }));
  };

  const handleAddQualification = () => {
    if (qualificationInput.degree && qualificationInput.institution) {
      setFormData(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, { ...qualificationInput }]
      }));
      setQualificationInput({ degree: '', institution: '', year: '' });
    }
  };

  const handleRemoveQualification = (index) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.sessionRate || formData.sessionRate <= 0) {
        throw new Error('Please enter a valid session rate');
      }

      if (formData.isStudent && !formData.supervisorId) {
        throw new Error('Supervisor ID is required for student therapists');
      }

      const profileData = {
        ...formData,
        sessionRate: Number(formData.sessionRate),
        yearsOfExperience: Number(formData.yearsOfExperience),
      };

      // Remove supervisorId if not a student
      if (!formData.isStudent) {
        delete profileData.supervisorId;
      }

      console.log('Submitting profile data:', profileData);

      const response = await therapistService.createTherapistProfile(profileData);
      console.log('Profile created successfully:', response);
      
      // Navigate to dashboard after successful creation
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating profile:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#748DAE] to-[#9ECAD6] rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Therapist Profile
            </h2>
            <p className="text-gray-600">
              Please provide the following information to complete your profile setup
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bio */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Professional Bio *
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="4"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#748DAE] focus:border-transparent transition-all"
                placeholder="Tell us about your professional background and approach to therapy..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Session Rate */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Session Rate (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    name="sessionRate"
                    value={formData.sessionRate}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="150"
                    className="pl-7"
                  />
                </div>
              </div>

              {/* Years of Experience */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Years of Experience
                </label>
                <Input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="5"
                />
              </div>
            </div>

            {/* License Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                License Number
              </label>
              <Input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                placeholder="Your professional license number"
              />
            </div>

            {/* Is Student */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isStudent"
                  checked={formData.isStudent}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-[#748DAE] focus:ring-[#748DAE] border-gray-300 rounded"
                />
                <label className="ml-3 block text-sm font-medium text-gray-700">
                  I am a student therapist under supervision
                </label>
              </div>
            </div>

            {/* Supervisor ID (conditional) */}
            {formData.isStudent && (
              <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Supervisor Profile ID *
                </label>
                <Input
                  type="text"
                  name="supervisorId"
                  value={formData.supervisorId}
                  onChange={handleInputChange}
                  required={formData.isStudent}
                  placeholder="Enter your supervisor's Profile ID (not User ID)"
                />
                <p className="text-xs text-gray-600 mt-2">
                  ⚠️ <strong>Important:</strong> Ask your supervisor for their <strong>Supervisor Profile ID</strong> (not their User ID). 
                  They can find this in their dashboard after completing their supervisor profile.
                </p>
              </div>
            )}

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

            {/* Qualifications */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Qualifications
              </label>
              <div className="space-y-3 p-4 bg-white rounded-lg mb-3 border border-gray-200">
                <Input
                  type="text"
                  value={qualificationInput.degree}
                  onChange={(e) => setQualificationInput(prev => ({ ...prev, degree: e.target.value }))}
                  placeholder="Degree (e.g., PhD in Clinical Psychology)"
                />
                <Input
                  type="text"
                  value={qualificationInput.institution}
                  onChange={(e) => setQualificationInput(prev => ({ ...prev, institution: e.target.value }))}
                  placeholder="Institution (e.g., Harvard University)"
                />
                <Input
                  type="number"
                  value={qualificationInput.year}
                  onChange={(e) => setQualificationInput(prev => ({ ...prev, year: e.target.value }))}
                  placeholder="Year (e.g., 2015)"
                />
                <Button
                  type="button"
                  onClick={handleAddQualification}
                  variant="secondary"
                  className="w-full bg-[#748DAE] hover:bg-[#657B9D] text-white"
                >
                  Add Qualification
                </Button>
              </div>
              <div className="space-y-2">
                {formData.qualifications.map((qual, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{qual.degree}</p>
                      <p className="text-sm text-gray-600 mt-1">{qual.institution}</p>
                      {qual.year && <p className="text-xs text-gray-500 mt-1">Year: {qual.year}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQualification(index)}
                      className="ml-4 text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#748DAE] to-[#9ECAD6] hover:from-[#657B9D] hover:to-[#8BB9C5] text-white py-3 text-lg font-semibold shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Profile...
                  </span>
                ) : 'Complete Profile Setup'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
