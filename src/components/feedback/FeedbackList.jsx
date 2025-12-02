import { motion } from 'framer-motion';
import { Star, MessageSquare, Calendar, User, Eye, EyeOff, Award, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';

const StarDisplay = ({ rating, max = 5 }) => {
  return (
    <div className="flex gap-0.5">
      {[...Array(max)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-2 text-sm text-secondary-600 font-medium">{rating.toFixed(1)}/5</span>
    </div>
  );
};

export const FeedbackCard = ({ feedback, currentUserId, onResponse }) => {
  const isReceiver = feedback.toUser._id === currentUserId;
  const isGiver = feedback.fromUser._id === currentUserId;
  
  const getTypeColor = (type) => {
    switch (type) {
      case 'patient-to-therapist':
        return 'bg-blue-100 text-blue-800';
      case 'therapist-to-patient':
        return 'bg-green-100 text-green-800';
      case 'supervisor-to-therapist':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'patient-to-therapist':
        return 'Session Feedback';
      case 'therapist-to-patient':
        return 'Progress Notes';
      case 'supervisor-to-therapist':
        return 'Performance Review';
      default:
        return type;
    }
  };

  const categoryLabels = {
    professionalism: 'Professionalism',
    communication: 'Communication',
    effectiveness: 'Effectiveness',
    empathy: 'Empathy',
    engagement: 'Engagement',
    progress: 'Progress',
    homework_completion: 'Homework',
    openness: 'Openness',
    clinical_skills: 'Clinical Skills',
    documentation: 'Documentation',
    ethical_practice: 'Ethical Practice',
    professional_development: 'Professional Development',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(feedback.feedbackType)}`}>
                {getTypeLabel(feedback.feedbackType)}
              </span>
              {feedback.isAnonymous && (
                <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  <EyeOff className="h-3 w-3" />
                  Anonymous
                </span>
              )}
              {feedback.reviewPeriod && (
                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs">
                  {feedback.reviewPeriod}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-secondary-600">
              <User className="h-4 w-4" />
              <span>
                {isGiver && 'To: '}
                {isReceiver && 'From: '}
                {feedback.isAnonymous && !isGiver ? (
                  'Anonymous'
                ) : (
                  isGiver ? feedback.toUser.fullName : feedback.fromUser.fullName
                )}
              </span>
            </div>
            {feedback.sessionId && (
              <div className="flex items-center gap-2 text-xs text-secondary-500 mt-1">
                <Calendar className="h-3 w-3" />
                <span>
                  Session: {new Date(feedback.sessionId.scheduledAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          <div className="text-xs text-secondary-500">
            {new Date(feedback.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Overall Rating */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-secondary-700 mb-2">Overall Rating</h4>
          <StarDisplay rating={feedback.overallRating} />
        </div>

        {/* Category Ratings */}
        {feedback.categoryRatings && Object.keys(feedback.categoryRatings).some(key => feedback.categoryRatings[key]) && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-secondary-700 mb-2">Detailed Ratings</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(feedback.categoryRatings)
                .filter(([_, value]) => value)
                .map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-xs text-secondary-600">{categoryLabels[key] || key}</span>
                    <StarDisplay rating={value} max={5} />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Strengths */}
        {feedback.strengths && feedback.strengths.length > 0 && (
          <div className="mb-4">
            <h4 className="flex items-center gap-2 text-sm font-medium text-secondary-700 mb-2">
              <Award className="h-4 w-4 text-green-600" />
              Strengths
            </h4>
            <ul className="space-y-1">
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-secondary-600 pl-4">
                  • {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas for Improvement */}
        {feedback.areasForImprovement && feedback.areasForImprovement.length > 0 && (
          <div className="mb-4">
            <h4 className="flex items-center gap-2 text-sm font-medium text-secondary-700 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              Areas for Improvement
            </h4>
            <ul className="space-y-1">
              {feedback.areasForImprovement.map((area, index) => (
                <li key={index} className="text-sm text-secondary-600 pl-4">
                  • {area}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Comment */}
        {feedback.comment && (
          <div className="mb-4">
            <h4 className="flex items-center gap-2 text-sm font-medium text-secondary-700 mb-2">
              <MessageSquare className="h-4 w-4" />
              Comments
            </h4>
            <p className="text-sm text-secondary-600 leading-relaxed bg-gray-50 p-3 rounded">
              {feedback.comment}
            </p>
          </div>
        )}

        {/* Recommendations */}
        {feedback.recommendations && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-secondary-700 mb-2">Recommendations</h4>
            <p className="text-sm text-secondary-600 leading-relaxed bg-blue-50 p-3 rounded">
              {feedback.recommendations}
            </p>
          </div>
        )}

        {/* Response */}
        {feedback.response?.text && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-secondary-700 mb-2">Response</h4>
            <div className="bg-primary-50 p-3 rounded">
              <p className="text-sm text-secondary-600">{feedback.response.text}</p>
              <p className="text-xs text-secondary-500 mt-2">
                {new Date(feedback.response.respondedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Response Button (if receiver and no response yet) */}
        {isReceiver && !feedback.response?.text && onResponse && (
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={() => onResponse(feedback)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Add Response →
            </button>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export const FeedbackList = ({ feedbacks, currentUserId, loading, emptyMessage, onResponse }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">{emptyMessage || 'No feedback available'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedbacks.map((feedback) => (
        <FeedbackCard
          key={feedback._id}
          feedback={feedback}
          currentUserId={currentUserId}
          onResponse={onResponse}
        />
      ))}
    </div>
  );
};
