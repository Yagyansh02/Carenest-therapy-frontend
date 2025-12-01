import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Calendar, MessageSquare, Settings, FileText, Heart } from 'lucide-react';
import { TherapistDashboardContent } from '../../components/dashboard/TherapistDashboardContent';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getDashboardContent = () => {
    switch (user?.role) {
      case 'patient':
        return <PatientDashboard user={user} navigate={navigate} />;
      case 'therapist':
        return <TherapistDashboardContent user={user} />;
      case 'supervisor':
        return <SupervisorDashboard user={user} />;
      default:
        return <DefaultDashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {user?.role !== 'therapist' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.fullName || user?.email}!
            </h1>
            <p className="text-gray-600">
              Role: <span className="text-[#748DAE] font-medium capitalize">{user?.role}</span>
            </p>
          </motion.div>
        )}

        {getDashboardContent()}
      </div>
    </div>
  );
};

const PatientDashboard = ({ user, navigate }) => {
  const stats = [
    { label: 'Upcoming Sessions', value: '3', icon: Calendar, color: 'bg-[#9ECAD6]' },
    { label: 'Messages', value: '5', icon: MessageSquare, color: 'bg-[#748DAE]' },
    { label: 'Assessments', value: '2', icon: FileText, color: 'bg-[#F5CBCB]' },
    { label: 'Progress', value: '78%', icon: Heart, color: 'bg-[#9ECAD6]' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Sessions</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:shadow-sm transition-shadow cursor-pointer">
              <p className="font-medium text-gray-900">Dr. Sarah Johnson</p>
              <p className="text-sm text-gray-600 mt-1">Tomorrow at 2:00 PM</p>
              <p className="text-xs text-[#748DAE] mt-2 font-medium">Cognitive Behavioral Therapy</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:shadow-sm transition-shadow cursor-pointer">
              <p className="font-medium text-gray-900">Dr. Michael Chen</p>
              <p className="text-sm text-gray-600 mt-1">Friday at 10:00 AM</p>
              <p className="text-xs text-[#748DAE] mt-2 font-medium">Mindfulness Session</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/therapists')}
              className="w-full p-4 text-left bg-[#9ECAD6] hover:bg-[#8BB9C5] text-white rounded-lg transition-all hover:shadow-md"
            >
              <p className="font-medium">Book New Session</p>
              <p className="text-sm opacity-90 mt-1">Schedule with your therapist</p>
            </button>
            <button 
              onClick={() => navigate('/assessment')}
              className="w-full p-4 text-left bg-[#748DAE] hover:bg-[#657B9D] text-white rounded-lg transition-all hover:shadow-md"
            >
              <p className="font-medium">Take Assessment</p>
              <p className="text-sm opacity-90 mt-1">Complete wellness check-in</p>
            </button>
            <button className="w-full p-4 text-left bg-[#F5CBCB] hover:bg-[#E4BABA] text-white rounded-lg transition-all hover:shadow-md">
              <p className="font-medium">View Resources</p>
              <p className="text-sm opacity-90 mt-1">Access self-help materials</p>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const SupervisorDashboard = ({ user }) => {
  const stats = [
    { label: 'Therapists', value: '12', icon: User, color: 'bg-[#9ECAD6]' },
    { label: 'Total Patients', value: '156', icon: Heart, color: 'bg-[#748DAE]' },
    { label: 'Pending Reviews', value: '8', icon: FileText, color: 'bg-[#F5CBCB]' },
    { label: 'Reports', value: '24', icon: Settings, color: 'bg-[#9ECAD6]' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-900">New therapist onboarded: Dr. Emily White</p>
              <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-900">Monthly report generated</p>
              <p className="text-xs text-gray-500 mt-1">1 day ago</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full p-4 text-left bg-[#9ECAD6] hover:bg-[#8BB9C5] text-white rounded-lg transition-colors">
              <p className="font-medium">Manage Therapists</p>
            </button>
            <button className="w-full p-4 text-left bg-[#748DAE] hover:bg-[#657B9D] text-white rounded-lg transition-colors">
              <p className="font-medium">View Reports</p>
            </button>
            <button className="w-full p-4 text-left bg-[#F5CBCB] hover:bg-[#E4BABA] text-white rounded-lg transition-colors">
              <p className="font-medium">System Settings</p>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const DefaultDashboard = ({ user }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg shadow-sm p-8 border border-gray-100 text-center"
    >
      <User className="h-16 w-16 mx-auto text-[#9ECAD6] mb-4" />
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to CareNest</h2>
      <p className="text-gray-600">Your dashboard is being set up. Please contact support if you need assistance.</p>
    </motion.div>
  );
};
