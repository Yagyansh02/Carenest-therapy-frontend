import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { therapistService } from '../../api/therapist';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Award, Briefcase, GraduationCap, Star } from 'lucide-react';

export const TherapistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        const response = await therapistService.getTherapistById(id);
        console.log('Therapist data:', response.data.data);
        setTherapist(response.data.data);
      } catch (error) {
        console.error('Failed to fetch therapist details', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTherapist();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-24 pb-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#748DAE] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading therapist details...</p>
        </div>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-24 pb-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Therapist not found</p>
          <button
            onClick={() => navigate('/therapists')}
            className="mt-4 text-[#748DAE] hover:text-[#657B9D] font-medium"
          >
            ← Back to Therapists
          </button>
        </div>
      </div>
    );
  }

  // Extract data from the nested structure
  const fullName = therapist.userId?.fullName || 'Unknown Therapist';
  const email = therapist.userId?.email || '';
  const bio = therapist.bio || 'No bio available';
  const specializations = therapist.specializations || [];
  const yearsOfExperience = therapist.yearsOfExperience || 0;
  const sessionRate = therapist.sessionRate || 0;
  const qualifications = therapist.qualifications || [];
  const verificationStatus = therapist.verificationStatus || 'pending';
  const averageRating = therapist.averageRating || 0;
  const totalSessions = therapist.totalSessions || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-[#748DAE] hover:text-[#657B9D] font-medium flex items-center gap-2"
        >
          ← Back
        </button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header Card */}
            <Card className="p-8 bg-white border border-gray-100">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-[#9ECAD6] to-[#748DAE] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-4xl">
                    {fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
                      {specializations.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {specializations.map((spec, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-[#9ECAD6] text-white text-sm rounded-full"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {verificationStatus === 'verified' && (
                      <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        <Award className="h-4 w-4" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-[#748DAE]" />
                      <span>{yearsOfExperience} years of experience</span>
                    </div>
                    {averageRating > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <span>{averageRating.toFixed(1)} rating</span>
                      </div>
                    )}
                    {totalSessions > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">•</span>
                        <span>{totalSessions} sessions completed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* About Section */}
            <Card className="p-8 bg-white border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{bio}</p>
            </Card>

            {/* Qualifications Section */}
            {qualifications.length > 0 && (
              <Card className="p-8 bg-white border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-[#748DAE]" />
                  Qualifications
                </h2>
                <div className="space-y-4">
                  {qualifications.map((qual, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900">{qual.degree}</h3>
                      <p className="text-sm text-gray-600 mt-1">{qual.institution}</p>
                      {qual.year && (
                        <p className="text-xs text-gray-500 mt-1">{qual.year}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card className="p-6 sticky top-24 bg-white border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Book a Session</h3>
              <p className="mt-2 text-sm text-gray-500">Available for online consultation</p>
              
              {/* Session Rate */}
              <div className="mt-4 p-4 bg-gradient-to-r from-[#9ECAD6] to-[#748DAE] rounded-lg">
                <p className="text-sm text-white opacity-90">Session Rate</p>
                <p className="text-3xl font-bold text-white mt-1">₹{sessionRate}</p>
                <p className="text-xs text-white opacity-75 mt-1">per session</p>
              </div>

              {/* Book Button */}
              <div className="mt-6">
                <Link to={`/book/${therapist._id}`}>
                  <Button className="w-full bg-[#748DAE] hover:bg-[#657B9D] text-white py-3 rounded-lg font-semibold transition-colors">
                    Book Appointment
                  </Button>
                </Link>
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Available for online sessions</span>
                </div>
                {verificationStatus === 'verified' && (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-green-500" />
                    <span>Verified Professional</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};