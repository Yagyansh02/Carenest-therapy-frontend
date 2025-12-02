import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-3xl px-4 pt-24 pb-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-secondary-900">Profile Settings</h1>
      
      <Card className="mt-8 p-6">
        <h3 className="text-lg font-medium text-secondary-900">Personal Information</h3>
        <form className="mt-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Input label="Full Name" defaultValue={user?.fullName} />
            <Input label="Email" defaultValue={user?.email} disabled />
          </div>
          <Button>Save Changes</Button>
        </form>
      </Card>
    </div>
  );
};