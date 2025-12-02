import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Send, Lightbulb } from 'lucide-react';
import { Button } from '../common/Button';

const StarRating = ({ value, onChange, label }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-secondary-700">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                star <= (hover || value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      <p className="text-xs text-secondary-500">
        {value ? `${value}/5` : 'Click to rate'}
      </p>
    </div>
  );
};

export const TherapistToPatientFeedback = ({ sessionId, patientId, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    overallRating: 0,
    categoryRatings: {
      engagement: 0,
      progress: 0,
      homework_completion: 0,
      openness: 0,
    },
    comment: '',
    recommendations: '',
  });

  const handleCategoryChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      categoryRatings: {
        ...prev.categoryRatings,
        [category]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      feedbackType: 'therapist-to-patient',
      toUserId: patientId,
      sessionId,
    });
  };

  const categories = [
    { key: 'engagement', label: 'Session Engagement', description: 'Active participation in discussion' },
    { key: 'progress', label: 'Progress Made', description: 'Movement towards therapeutic goals' },
    { key: 'homework_completion', label: 'Homework Completion', description: 'Following through on assignments' },
    { key: 'openness', label: 'Openness', description: 'Willingness to share and explore' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Session Progress Notes</h3>
        <p className="text-sm text-blue-700">
          Provide constructive feedback to help your patient track their progress and growth.
        </p>
      </div>

      {/* Overall Rating */}
      <StarRating
        label="Overall Session Effectiveness *"
        value={formData.overallRating}
        onChange={(value) => setFormData(prev => ({ ...prev, overallRating: value }))}
      />

      {/* Category Ratings */}
      <div className="space-y-4 border-t pt-4">
        <h4 className="font-medium text-secondary-900">Patient Progress Indicators</h4>
        <div className="space-y-4">
          {categories.map(({ key, label, description }) => (
            <div key={key} className="bg-gray-50 p-4 rounded-lg">
              <StarRating
                label={label}
                value={formData.categoryRatings[key]}
                onChange={(value) => handleCategoryChange(key, value)}
              />
              <p className="text-xs text-secondary-500 mt-1">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Session Summary */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-secondary-700 mb-2">
          <MessageSquare className="h-4 w-4" />
          Session Summary & Observations
        </label>
        <textarea
          value={formData.comment}
          onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
          rows={4}
          maxLength={2000}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          placeholder="Key points discussed, breakthroughs, challenges faced..."
        />
        <p className="text-xs text-secondary-500 mt-1">
          {formData.comment.length}/2000 characters
        </p>
      </div>

      {/* Recommendations */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-secondary-700 mb-2">
          <Lightbulb className="h-4 w-4" />
          Recommendations & Next Steps
        </label>
        <textarea
          value={formData.recommendations}
          onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
          rows={3}
          maxLength={1000}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          placeholder="Homework, practices to try, areas to focus on..."
        />
        <p className="text-xs text-secondary-500 mt-1">
          {formData.recommendations.length}/1000 characters
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || formData.overallRating === 0}
          className="flex-1 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Feedback
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
