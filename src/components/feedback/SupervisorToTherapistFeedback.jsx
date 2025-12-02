import { useState } from 'react';
import { Star, MessageSquare, Send, Award, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

const StarRating = ({ value, onChange, label, description }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-secondary-700">{label}</label>
      {description && <p className="text-xs text-secondary-500">{description}</p>}
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

export const SupervisorToTherapistFeedback = ({ therapistId, sessionId, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    overallRating: 0,
    categoryRatings: {
      clinical_skills: 0,
      documentation: 0,
      ethical_practice: 0,
      professional_development: 0,
    },
    comment: '',
    strengths: [''],
    areasForImprovement: [''],
    recommendations: '',
    reviewPeriod: '',
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

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty strings from arrays
    const cleanData = {
      ...formData,
      strengths: formData.strengths.filter(s => s.trim() !== ''),
      areasForImprovement: formData.areasForImprovement.filter(a => a.trim() !== ''),
      feedbackType: 'supervisor-to-therapist',
      toUserId: therapistId,
      sessionId: sessionId || undefined,
    };

    onSubmit(cleanData);
  };

  const categories = [
    { 
      key: 'clinical_skills', 
      label: 'Clinical Skills', 
      description: 'Therapeutic techniques and intervention effectiveness' 
    },
    { 
      key: 'documentation', 
      label: 'Documentation', 
      description: 'Session notes, treatment plans, and record keeping' 
    },
    { 
      key: 'ethical_practice', 
      label: 'Ethical Practice', 
      description: 'Professional boundaries, confidentiality, and ethics' 
    },
    { 
      key: 'professional_development', 
      label: 'Professional Development', 
      description: 'Growth mindset, learning, and skill enhancement' 
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-purple-900 mb-2">Performance Review</h3>
        <p className="text-sm text-purple-700">
          Provide constructive feedback to support the therapist's professional growth and development.
        </p>
      </div>

      {/* Review Period */}
      <div>
        <label className="text-sm font-medium text-secondary-700 mb-2 block">
          Review Period (e.g., "Q1 2024", "Monthly Review")
        </label>
        <Input
          type="text"
          value={formData.reviewPeriod}
          onChange={(e) => setFormData(prev => ({ ...prev, reviewPeriod: e.target.value }))}
          placeholder="Enter review period..."
        />
      </div>

      {/* Overall Rating */}
      <StarRating
        label="Overall Performance *"
        value={formData.overallRating}
        onChange={(value) => setFormData(prev => ({ ...prev, overallRating: value }))}
      />

      {/* Category Ratings */}
      <div className="space-y-4 border-t pt-4">
        <h4 className="font-medium text-secondary-900">Performance Indicators</h4>
        <div className="space-y-4">
          {categories.map(({ key, label, description }) => (
            <div key={key} className="bg-gray-50 p-4 rounded-lg">
              <StarRating
                label={label}
                description={description}
                value={formData.categoryRatings[key]}
                onChange={(value) => handleCategoryChange(key, value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Strengths */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-secondary-700 mb-2">
          <Award className="h-4 w-4 text-green-600" />
          Strengths & Positive Attributes
        </label>
        {formData.strengths.map((strength, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              type="text"
              value={strength}
              onChange={(e) => handleArrayChange('strengths', index, e.target.value)}
              placeholder="Enter a strength or positive attribute..."
            />
            {formData.strengths.length > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => removeArrayItem('strengths', index)}
                className="px-3"
              >
                ✕
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => addArrayItem('strengths')}
          className="w-full text-sm"
        >
          + Add Another Strength
        </Button>
      </div>

      {/* Areas for Improvement */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-secondary-700 mb-2">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          Areas for Improvement
        </label>
        {formData.areasForImprovement.map((area, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              type="text"
              value={area}
              onChange={(e) => handleArrayChange('areasForImprovement', index, e.target.value)}
              placeholder="Enter an area for growth..."
            />
            {formData.areasForImprovement.length > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => removeArrayItem('areasForImprovement', index)}
                className="px-3"
              >
                ✕
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => addArrayItem('areasForImprovement')}
          className="w-full text-sm"
        >
          + Add Another Area
        </Button>
      </div>

      {/* General Comments */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-secondary-700 mb-2">
          <MessageSquare className="h-4 w-4" />
          Detailed Comments
        </label>
        <textarea
          value={formData.comment}
          onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
          rows={4}
          maxLength={2000}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          placeholder="Overall observations, context, specific examples..."
        />
        <p className="text-xs text-secondary-500 mt-1">
          {formData.comment.length}/2000 characters
        </p>
      </div>

      {/* Recommendations */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-secondary-700 mb-2">
          <TrendingUp className="h-4 w-4" />
          Development Recommendations & Action Plan
        </label>
        <textarea
          value={formData.recommendations}
          onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
          rows={3}
          maxLength={1000}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          placeholder="Specific actions, training, resources, goals for next review period..."
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
              Submit Review
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
