import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { therapistService } from '../../api/therapist';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export const TherapistDetail = () => {
  const { id } = useParams();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        const response = await therapistService.getTherapistById(id);
        setTherapist(response.data.data);
      } catch (error) {
        console.error('Failed to fetch therapist details', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTherapist();
  }, [id]);

  if (loading) return <div className="pt-24 pb-8 text-center">Loading...</div>;
  if (!therapist) return <div className="pt-24 pb-8 text-center">Therapist not found</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="h-32 w-32 rounded-full bg-secondary-200" />
              <div>
                <h1 className="text-3xl font-bold text-secondary-900">{therapist.fullName}</h1>
                <p className="text-lg text-primary-600">{therapist.specialization}</p>
                <p className="mt-2 text-secondary-500">{therapist.experience} years of experience</p>
              </div>
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-secondary-900">About</h2>
              <p className="mt-4 text-secondary-600 leading-relaxed">{therapist.bio}</p>
            </div>
          </Card>
        </div>
        <div>
          <Card className="p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-secondary-900">Book a Session</h3>
            <p className="mt-2 text-sm text-secondary-500">Available for online consultation</p>
            <div className="mt-6 space-y-4">
              <Link to={`/book/${therapist._id}`}>
                <Button className="w-full">Book Appointment</Button>
              </Link>
              <Button variant="outline" className="w-full">Send Message</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};