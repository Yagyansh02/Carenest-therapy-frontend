import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { AssessmentPDF } from '../../components/assessment/AssessmentPDF';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import {
  submitAssessment,
  fetchMyAssessment,
  updateFormField,
  toggleConcern,
  setCurrentStep,
  nextStep as nextStepAction,
  previousStep as previousStepAction,
  clearError,
  selectFormData,
  selectCurrentStep,
  selectHasAssessment,
  selectLoading,
  selectError,
} from '../../store/slices/assessmentSlice';

export const AssessmentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Redux state
  const formData = useSelector(selectFormData);
  const currentStep = useSelector(selectCurrentStep);
  const hasAssessment = useSelector(selectHasAssessment);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  
  // Local state
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [validationError, setValidationError] = useState('');
  const [hasInteractedWithStep7, setHasInteractedWithStep7] = useState(false);

  const totalSteps = 7;

  // Show welcome message if coming from login
  useEffect(() => {
    if (location.state?.message) {
      setWelcomeMessage(location.state.message);
    }
  }, [location.state]);

  // Initialize and check if user already has an assessment
  useEffect(() => {
    // Always ensure we start at step 1 on mount
    dispatch(setCurrentStep(1));
    
    const loadAssessment = async () => {
      try {
        const result = await dispatch(fetchMyAssessment()).unwrap();
        // If assessment exists and has data, it will be pre-filled
        // But we still start at step 1 for review
        // Allow existing assessment to be submitted without re-interacting with step 7
        if (result?.answers?.impactLevel) {
          setHasInteractedWithStep7(true);
        }
      } catch (error) {
        // No assessment found - form will remain empty at step 1
        setHasInteractedWithStep7(false);
      }
    };
    
    loadAssessment();
  }, [dispatch]);

  const handleInputChange = (field, value) => {
    dispatch(updateFormField({ field, value }));
    setValidationError('');
    dispatch(clearError('submit'));
    
    // Track interaction with step 7's impact level
    if (field === 'impactLevel' && currentStep === 7) {
      setHasInteractedWithStep7(true);
    }
  };

  const handleConcernToggle = (concern) => {
    dispatch(toggleConcern(concern));
    setValidationError('');
    dispatch(clearError('submit'));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.ageGroup) {
          setValidationError('Please select your age group');
          return false;
        }
        break;
      case 2:
        if (!formData.occupation) {
          setValidationError('Please select your occupation');
          return false;
        }
        break;
      case 3:
        if (!formData.lifestyle) {
          setValidationError('Please select your lifestyle');
          return false;
        }
        break;
      case 4:
        if (!formData.activityLevel) {
          setValidationError('Please select your activity level');
          return false;
        }
        break;
      case 5:
        if (formData.concerns.length === 0) {
          setValidationError('Please select at least one concern');
          return false;
        }
        break;
      case 6:
        if (!formData.duration) {
          setValidationError('Please select the duration');
          return false;
        }
        break;
      case 7:
        if (!hasInteractedWithStep7) {
          setValidationError('Please adjust the impact level slider to continue');
          return false;
        }
        if (!formData.impactLevel || formData.impactLevel < 1 || formData.impactLevel > 5) {
          setValidationError('Please rate the impact level');
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
        dispatch(nextStepAction());
        // Reset step 7 interaction flag when moving to step 7
        if (currentStep === 6) {
          setHasInteractedWithStep7(false);
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      dispatch(previousStepAction());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent submission if not on the last step
    if (currentStep !== totalSteps) {
      return;
    }
    
    if (!validateStep()) {
      return;
    }

    setValidationError('');

    try {
      await dispatch(submitAssessment(formData)).unwrap();
      // Navigate to recommendations page
      navigate('/assessment/recommendations');
    } catch (err) {
      console.error('Assessment submission error:', err);
      // Error is already set in Redux state
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {hasAssessment && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-900">Assessment Completed</h3>
              <p className="text-sm text-gray-600">You can download your assessment report or update your answers below.</p>
            </div>
            <PDFDownloadLink
              document={<AssessmentPDF assessment={formData} />}
              fileName="assessment-report.pdf"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              {({ blob, url, loading, error }) =>
                loading ? 'Generating PDF...' : 'Download Report'
              }
            </PDFDownloadLink>
          </div>
        )}
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
          {(validationError || error.submit) && (
            <div className={`mb-6 p-4 rounded-lg border ${validationError?.includes('slider') ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
              <p className={`text-sm ${validationError?.includes('slider') ? 'text-blue-600' : 'text-red-600'}`}>{validationError || error.submit}</p>
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
                <Button type="submit" disabled={loading.submit}>
                  {loading.submit ? 'Submitting...' : 'Get Recommendations'}
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
