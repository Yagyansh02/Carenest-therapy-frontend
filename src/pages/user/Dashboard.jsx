import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';

export const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-secondary-900">Welcome back, {user?.fullName}</h1>
      
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-secondary-900">Upcoming Appointments</h3>
          <p className="mt-2 text-secondary-500">No upcoming appointments scheduled.</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-medium text-secondary-900">Recent Assessments</h3>
          <p className="mt-2 text-secondary-500">You haven't taken any assessments yet.</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-medium text-secondary-900">Messages</h3>
          <p className="mt-2 text-secondary-500">No new messages.</p>
        </Card>
      </div>
    </div>
  );
};