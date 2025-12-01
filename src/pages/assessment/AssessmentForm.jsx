import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { assessmentService } from '../../api/assessment';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export const AssessmentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [formData, setFormData] = useState({
    ageGroup: '',
    occupation: '',
    lifestyle: '',
    activityLevel: '',
    concerns: [],
    otherConcern: '',
    duration: '',
    impactLevel: 3,
  });

  const totalSteps = 7;

  // Show welcome message if coming from login
  useEffect(() => {
    if (location.state?.message) {
      setWelcomeMessage(location.state.message);
    }
  }, [location.state]);

  // Check if user already has an assessment
  useEffect(() => {
    const checkExistingAssessment = async () => {
      try {
        const response = await assessmentService.getMyAssessment();
        if (response.data?.data) {
          // Pre-fill form with existing data
          const existingData = response.data.data.answers;
          setFormData({
            ageGroup: existingData.ageGroup || '',
            occupation: existingData.occupation || '',
            lifestyle: existingData.lifestyle || '',
            activityLevel: existingData.activityLevel || '',
            concerns: existingData.concerns || [],
            otherConcern: existingData.otherConcern || '',
            duration: existingData.duration || '',
            impactLevel: existingData.impactLevel || 3,
          });
        }
      } catch (err) {
        // No existing assessment or error - that's fine, start fresh
        console.log('No existing assessment found');
      }
    };
    checkExistingAssessment();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleConcernToggle = (concern) => {
    setFormData(prev => {
      const concerns = prev.concerns.includes(concern)
        ? prev.concerns.filter(c => c !== concern)
        : [...prev.concerns, concern];
      return { ...prev, concerns };
    });
    setError('');
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.ageGroup) {
          setError('Please select your age group');
          return false;
        }
        break;
      case 2:
        if (!formData.occupation) {
          setError('Please select your occupation');
          return false;
        }
        break;
      case 3:
        if (!formData.lifestyle) {
          setError('Please select your lifestyle');
          return false;
        }
        break;
      case 4:
        if (!formData.activityLevel) {
          setError('Please select your activity level');
          return false;
        }
        break;
      case 5:
        if (formData.concerns.length === 0) {
          setError('Please select at least one concern');
          return false;
        }
        break;
      case 6:
        if (!formData.duration) {
          setError('Please select the duration');
          return false;
        }
        break;
      case 7:
        if (!formData.impactLevel) {
          setError('Please rate the impact level');
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await assessmentService.submitAssessment(formData);
      // Navigate to recommendations page
      navigate('/assessment/recommendations');
    } catch (err) {
      console.error('Assessment submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-secondary-900">What's your age group?</h2>
            <p className="text-secondary-600">This helps us understand your life stage and tailor recommendations.</p>
            <div className="space-y-3">
              {['18-24', '25-34', '35-44', '45-54', '55-64', '65+'].map((age) => (
                <label key={age} className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="radio"
                    name="ageGroup"
                    value={age}
                    checked={formData.ageGroup === age}
                    onChange={(e) => handleInputChange('ageGroup', e.target.value)}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-3 text-secondary-900">{age}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-secondary-900">What's your current occupation?</h2>
            <p className="text-secondary-600">Understanding your work situation helps us match you better.</p>
            <div className="space-y-3">
              {['Student', 'Employed (Full-time)', 'Employed (Part-time)', 'Self-employed', 'Unemployed', 'Retired'].map((occ) => (
                <label key={occ} className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="radio"
                    name="occupation"
                    value={occ}
                    checked={formData.occupation === occ}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-3 text-secondary-900">{occ}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-secondary-900">How would you describe your lifestyle?</h2>
            <p className="text-secondary-600">This helps us understand your daily stress levels.</p>
            <div className="space-y-3">
              {[
                'High-stress, fast-paced',
                'Moderately busy, some downtime',
                'Balanced between work and personal life',
                'Relaxed, low-stress'
              ].map((lifestyle) => (
                <label key={lifestyle} className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="radio"
                    name="lifestyle"
                    value={lifestyle}
                    checked={formData.lifestyle === lifestyle}
                    onChange={(e) => handleInputChange('lifestyle', e.target.value)}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-3 text-secondary-900">{lifestyle}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-secondary-900">What's your physical activity level?</h2>
            <p className="text-secondary-600">Physical activity can affect mental health and therapy approach.</p>
            <div className="space-y-3">
              {[
                'Sedentary (little to no exercise)',
                'Lightly active (walking, yoga, stretching)',
                'Moderately active (exercise 3-4 days a week)',
                'Very active (intense workouts, sports, daily exercise)'
              ].map((activity) => (
                <label key={activity} className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="radio"
                    name="activityLevel"
                    value={activity}
                    checked={formData.activityLevel === activity}
                    onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-3 text-secondary-900">{activity}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-secondary-900">What are your primary mental health concerns?</h2>
            <p className="text-secondary-600">Select all that apply. This helps us match you with the right specialist.</p>
            <div className="space-y-3">
              {[
                'Anxiety',
                'Depression',
                'Overthinking',
                'Stress',
                'Low self-esteem',
                'Self-improvement',
                'Anger issues',
                'Grief/loss',
                'Sleep disturbances',
                'OCD',
                'Sexual dysfunction',
                'Bipolar disorder',
                'Addiction',
                'Autism spectrum disorder',
                'None of the above'
              ].map((concern) => (
                <label key={concern} className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.concerns.includes(concern)}
                    onChange={() => handleConcernToggle(concern)}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                  />
                  <span className="ml-3 text-secondary-900">{concern}</span>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Other concerns (optional)
              </label>
              <input
                type="text"
                value={formData.otherConcern}
                onChange={(e) => handleInputChange('otherConcern', e.target.value)}
                placeholder="Describe any other concerns..."
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-secondary-900">How long have you been experiencing these concerns?</h2>
            <p className="text-secondary-600">This helps us understand the chronicity of your situation.</p>
            <div className="space-y-3">
              {[
                'Less than a month',
                '1-6 months',
                '6 months - 1 year',
                'More than 1 year'
              ].map((duration) => (
                <label key={duration} className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="radio"
                    name="duration"
                    value={duration}
                    checked={formData.duration === duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-3 text-secondary-900">{duration}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-secondary-900">How much do these concerns impact your daily life?</h2>
            <p className="text-secondary-600">Rate from 1 (minimal impact) to 5 (severe impact)</p>
            <div className="space-y-6">
              <input
                type="range"
                min="1"
                max="5"
                value={formData.impactLevel}
                onChange={(e) => handleInputChange('impactLevel', parseInt(e.target.value))}
                className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-secondary-600">
                <span>1 - Minimal</span>
                <span>2 - Mild</span>
                <span>3 - Moderate</span>
                <span>4 - Significant</span>
                <span>5 - Severe</span>
              </div>
              <div className="text-center">
                <span className="inline-block px-6 py-3 bg-primary-100 text-primary-700 rounded-lg text-xl font-bold">
                  {formData.impactLevel}
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="p-8">
          {/* Welcome message */}
          {welcomeMessage && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">{welcomeMessage}</p>
            </div>
          )}

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-secondary-600">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm font-medium text-secondary-600">
                {Math.round((currentStep / totalSteps) * 100)}%
              </span>
            </div>
            <div className="w-full bg-secondary-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Step content */}
          <form onSubmit={handleSubmit}>
            {renderStep()}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-secondary-200">
              <Button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                variant="outline"
              >
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Get Recommendations'}
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Skip option */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-secondary-600 hover:text-secondary-900 text-sm underline"
          >
            Skip for now (you can complete this later)
          </button>
        </div>
      </div>
    </div>
  );
};
