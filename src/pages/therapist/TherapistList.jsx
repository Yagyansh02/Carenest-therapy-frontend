import { useEffect, useState } from 'react';
import { therapistService } from '../../api/therapist';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';

export const TherapistList = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const response = await therapistService.getAllTherapists();
        // Backend returns: { data: { therapists: [...], pagination: {...} } }
        const therapistsList = response.data.data?.therapists || [];
        setTherapists(therapistsList);
      } catch (error) {
        console.error('Failed to fetch therapists', error);
        setError('Failed to load therapists. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (therapists.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 pt-24 pb-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-secondary-900">Find a Therapist</h1>
        <div className="text-center py-12">
          <p className="text-secondary-600">No therapists available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-secondary-900">Find a Therapist</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {therapists.map((therapist) => (
          <Card key={therapist._id} className="flex flex-col p-6">
            <div className="mb-4 flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-700">
                  {therapist.userId?.fullName?.charAt(0) || 'T'}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary-900">
                  {therapist.userId?.fullName || 'Therapist'}
                </h3>
                <p className="text-sm text-secondary-500">
                  {therapist.specializations?.[0] || 'Mental Health Specialist'}
                </p>
              </div>
            </div>
            <p className="mb-4 flex-1 text-sm text-secondary-600 line-clamp-3">
              {therapist.bio || 'Experienced therapist dedicated to helping you achieve your mental health goals.'}
            </p>
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-secondary-600">Experience:</span>
              <span className="font-semibold text-secondary-900">{therapist.yearsOfExperience || 0} years</span>
            </div>
            <div className="mb-6 flex items-center justify-between text-sm">
              <span className="text-secondary-600">Session Rate:</span>
              <span className="font-semibold text-primary-600">₹{therapist.sessionRate || 0}</span>
            </div>
            <Link to={`/therapists/${therapist._id}`}>
              <Button className="w-full" variant="outline">View Profile</Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};