import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Send } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

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

export const PatientToTherapistFeedback = ({ sessionId, therapistId, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    overallRating: 0,
    categoryRatings: {
      professionalism: 0,
      communication: 0,
      effectiveness: 0,
      empathy: 0,
    },
    comment: '',
    isAnonymous: false,
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
      feedbackType: 'patient-to-therapist',
      toUserId: therapistId,
      sessionId,
    });
  };

  const categories = [
    { key: 'professionalism', label: 'Professionalism' },
    { key: 'communication', label: 'Communication' },
    { key: 'effectiveness', label: 'Effectiveness' },
    { key: 'empathy', label: 'Empathy' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <h3 className="font-semibold text-primary-900 mb-2">Rate Your Session</h3>
        <p className="text-sm text-primary-700">
          Your honest feedback helps us improve our services and ensures quality care.
        </p>
      </div>

      {/* Overall Rating */}
      <StarRating
        label="Overall Experience *"
        value={formData.overallRating}
        onChange={(value) => setFormData(prev => ({ ...prev, overallRating: value }))}
      />

      {/* Category Ratings */}
      <div className="space-y-4 border-t pt-4">
        <h4 className="font-medium text-secondary-900">Detailed Ratings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map(({ key, label }) => (
            <StarRating
              key={key}
              label={label}
              value={formData.categoryRatings[key]}
              onChange={(value) => handleCategoryChange(key, value)}
            />
          ))}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-secondary-700 mb-2">
          <MessageSquare className="h-4 w-4" />
          Additional Comments
        </label>
        <textarea
          value={formData.comment}
          onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
          rows={4}
          maxLength={2000}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          placeholder="Share your experience, what went well, or areas for improvement..."
        />
        <p className="text-xs text-secondary-500 mt-1">
          {formData.comment.length}/2000 characters
        </p>
      </div>

      {/* Anonymous Option */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="anonymous"
          checked={formData.isAnonymous}
          onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="anonymous" className="text-sm text-secondary-700">
          Submit anonymously (your identity will be hidden from the therapist)
        </label>
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
