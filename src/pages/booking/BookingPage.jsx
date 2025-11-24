import { useParams } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const BookingPage = () => {
  const { therapistId } = useParams();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Card className="p-8">
        <h1 className="text-2xl font-bold text-secondary-900">Book Appointment</h1>
        <p className="mt-2 text-secondary-500">Select a time slot for your session.</p>
        
        <div className="mt-8 h-64 flex items-center justify-center border-2 border-dashed border-secondary-200 rounded-lg">
          <p className="text-secondary-400">Calendar Integration Placeholder</p>
        </div>

        <div className="mt-8 flex justify-end">
          <Button size="lg">Confirm Booking</Button>
        </div>
      </Card>
    </div>
  );
};