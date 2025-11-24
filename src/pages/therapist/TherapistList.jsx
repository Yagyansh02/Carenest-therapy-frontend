import { useEffect, useState } from 'react';
import { therapistService } from '../../api/therapist';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';

export const TherapistList = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const response = await therapistService.getAllTherapists();
        setTherapists(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch therapists', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading therapists...</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-secondary-900">Find a Therapist</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {therapists.map((therapist) => (
          <Card key={therapist._id} className="flex flex-col p-6">
            <div className="mb-4 flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-secondary-200" />
              <div>
                <h3 className="text-lg font-semibold text-secondary-900">{therapist.fullName}</h3>
                <p className="text-sm text-secondary-500">{therapist.specialization || 'Specialist'}</p>
              </div>
            </div>
            <p className="mb-6 flex-1 text-sm text-secondary-600 line-clamp-3">
              {therapist.bio || 'Experienced therapist dedicated to helping you achieve your mental health goals.'}
            </p>
            <Link to={`/therapists/${therapist._id}`}>
              <Button className="w-full" variant="outline">View Profile</Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};