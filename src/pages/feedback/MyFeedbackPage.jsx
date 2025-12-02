import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { feedbackService } from '../../api/feedback';
import { FeedbackList } from '../../components/feedback/FeedbackList';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { motion } from 'framer-motion';
import { Star, TrendingUp, MessageSquare, Filter } from 'lucide-react';

export const MyFeedbackPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('received');
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchFeedbacks();
    if (user.role === 'therapist') {
      fetchStats();
    }
  }, [activeTab, filterType]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const params = {
        [activeTab === 'received' ? 'received' : 'given']: true,
        page: 1,
        limit: 50,
      };

      if (filterType !== 'all') {
        params.feedbackType = filterType;
      }

      const response = await feedbackService.getAllFeedbacks(params);
      setFeedbacks(response.data.data.feedbacks || []);
    } catch (error) {
      console.error('Failed to fetch feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await feedbackService.getFeedbackStats(user._id);
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleResponse = async (feedback) => {
    const responseText = prompt('Enter your response:');
    if (!responseText) return;

    try {
      await feedbackService.addResponse(feedback._id, responseText);
      alert('Response added successfully!');
      fetchFeedbacks();
    } catch (error) {
      console.error('Failed to add response:', error);
      alert(error.response?.data?.message || 'Failed to add response');
    }
  };

  const filterOptions = {
    patient: [
      { value: 'all', label: 'All Feedback' },
      { value: 'patient-to-therapist', label: 'My Ratings' },
      { value: 'therapist-to-patient', label: 'Progress Notes' },
    ],
    therapist: [
      { value: 'all', label: 'All Feedback' },
      { value: 'patient-to-therapist', label: 'Patient Ratings' },
      { value: 'supervisor-to-therapist', label: 'Supervisor Reviews' },
    ],
    supervisor: [
      { value: 'all', label: 'All Feedback' },
      { value: 'supervisor-to-therapist', label: 'My Reviews' },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            My Feedback
          </h1>
          <p className="text-secondary-600">
            View and manage feedback you've received and given
          </p>
        </motion.div>

        {/* Stats for Therapists */}
        {user.role === 'therapist' && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Average Rating</p>
                  <p className="text-2xl font-bold text-secondary-900">
                    {stats.averageRating?.toFixed(1) || 'N/A'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Total Feedback</p>
                  <p className="text-2xl font-bold text-secondary-900">
                    {stats.totalFeedbacks || 0}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Patient Reviews</p>
                  <p className="text-2xl font-bold text-secondary-900">
                    {stats.feedbacksByType?.['patient-to-therapist'] || 0}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Supervisor Reviews</p>
                  <p className="text-2xl font-bold text-secondary-900">
                    {stats.feedbacksByType?.['supervisor-to-therapist'] || 0}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'received'
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white text-secondary-600 hover:bg-secondary-50'
            }`}
          >
            Received ({feedbacks.filter(f => f.toUser._id === user._id).length})
          </button>
          <button
            onClick={() => setActiveTab('given')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'given'
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white text-secondary-600 hover:bg-secondary-50'
            }`}
          >
            Given ({feedbacks.filter(f => f.fromUser._id === user._id).length})
          </button>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-secondary-600" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {filterOptions[user.role]?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Feedback List */}
        <FeedbackList
          feedbacks={feedbacks}
          currentUserId={user._id}
          loading={loading}
          emptyMessage={`No feedback ${activeTab} yet`}
          onResponse={activeTab === 'received' ? handleResponse : null}
        />
      </div>
    </div>
  );
};
