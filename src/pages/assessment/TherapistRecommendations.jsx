import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { assessmentService } from '../../api/assessment';
import { AssessmentPDF } from '../../components/assessment/AssessmentPDF';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export const TherapistRecommendations = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [assessment, setAssessment] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [recResponse, assessResponse] = await Promise.all([
          assessmentService.getRecommendedTherapists(),
          assessmentService.getMyAssessment()
        ]);
        
        setRecommendations(recResponse.data?.data?.recommendations || []);
        setAssessment(assessResponse.data?.data?.answers);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load recommendations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getMatchPercentage = (score) => {
    // Convert score (0-100) to percentage
    return Math.round(score);
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-secondary-600">Finding the best therapists for you...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-secondary-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-secondary-600 mb-6">{error}</p>
            <div className="space-x-4">
              <Button onClick={fetchRecommendations}>Try Again</Button>
              <Button variant="outline" onClick={() => navigate('/assessment')}>
                Retake Assessment
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8 text-center">
            <div className="text-secondary-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-secondary-900 mb-2">No Recommendations Available</h2>
            <p className="text-secondary-600 mb-6">
              We couldn't find matching therapists at the moment. This might be because:
            </p>
            <ul className="text-left text-secondary-600 mb-6 max-w-md mx-auto space-y-2">
              <li>• No therapists have set up their profiles yet</li>
              <li>• No therapists match your specific needs right now</li>
              <li>• You haven't completed your assessment</li>
            </ul>
            <div className="space-x-4">
              <Button onClick={() => navigate('/therapists')}>
                Browse All Therapists
              </Button>
              <Button variant="outline" onClick={() => navigate('/assessment')}>
                Update Assessment
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            Your Recommended Therapists
          </h1>
          <p className="text-xl text-secondary-600 mb-6">
            Based on your assessment, we've found {recommendations.length} therapist{recommendations.length !== 1 ? 's' : ''} who match your needs
          </p>
          
          {assessment && (
            <div className="flex justify-center">
              <PDFDownloadLink
                document={<AssessmentPDF assessment={assessment} />}
                fileName="my-assessment-results.pdf"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                {({ loading }) => (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {loading ? 'Generating PDF...' : 'Download Assessment Results'}
                  </>
                )}
              </PDFDownloadLink>
            </div>
          )}
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {recommendations.map((rec) => (
            <Card key={rec.therapist._id} className="p-6 hover:shadow-xl transition-shadow">
              {/* Match percentage badge */}
              <div className="flex items-start justify-between mb-4">
                <div className={`px-4 py-2 rounded-full font-bold ${getMatchColor(rec.matchScore)}`}>
                  {getMatchPercentage(rec.matchScore)}% Match
                </div>
                {rec.therapist.verified && (
                  <div className="flex items-center text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Therapist Info */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-secondary-900 mb-2">
                  {rec.therapist.userId?.fullName || 'Therapist'}
                </h3>
                <p className="text-secondary-600 text-sm mb-2">
                  {rec.therapist.yearsOfExperience} years of experience
                </p>
                {rec.therapist.averageRating > 0 && (
                  <div className="flex items-center text-yellow-500 mb-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="ml-1 text-secondary-900 font-medium">
                      {rec.therapist.averageRating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Specializations */}
              {rec.therapist.specializations && rec.therapist.specializations.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-secondary-700 mb-2">Specializations:</p>
                  <div className="flex flex-wrap gap-2">
                    {rec.therapist.specializations.slice(0, 3).map((spec, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                    {rec.therapist.specializations.length > 3 && (
                      <span className="px-3 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-full">
                        +{rec.therapist.specializations.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Why matched */}
              {rec.matchReasons && rec.matchReasons.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Why we recommend:</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    {rec.matchReasons.slice(0, 2).map((reason, index) => (
                      <li key={index}>• {reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fee */}
              {rec.therapist.sessionFee && (
                <p className="text-secondary-900 font-bold text-lg mb-4">
                  ₹{rec.therapist.sessionFee}/session
                </p>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  onClick={() => navigate(`/therapists/${rec.therapist._id}`)}
                  className="w-full"
                >
                  View Profile
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/book/${rec.therapist._id}`)}
                  className="w-full"
                >
                  Book Session
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Action buttons */}
        <div className="text-center space-x-4">
          <Button onClick={() => navigate('/therapists')}>
            Browse All Therapists
          </Button>
          <Button variant="outline" onClick={() => navigate('/assessment')}>
            Retake Assessment
          </Button>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
