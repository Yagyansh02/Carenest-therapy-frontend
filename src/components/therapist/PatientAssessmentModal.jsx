import { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { X, FileText, User, Briefcase, Activity, Calendar, AlertCircle } from 'lucide-react';
import { assessmentService } from '../../api/assessment';
import { AssessmentPDF } from '../assessment/AssessmentPDF';

export const PatientAssessmentModal = ({ isOpen, onClose, patientId, patientName }) => {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && patientId) {
      fetchAssessment();
    }
  }, [isOpen, patientId]);

  const fetchAssessment = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await assessmentService.getAssessmentByPatientId(patientId);
      setAssessment(response.data.data);
    } catch (err) {
      console.error("Error fetching assessment:", err);
      setError("No assessment found for this patient");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getImpactColor = (level) => {
    if (level >= 4) return 'text-red-600 bg-red-50';
    if (level === 3) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const getImpactLabel = (level) => {
    const labels = {
      1: 'Minimal',
      2: 'Mild',
      3: 'Moderate',
      4: 'Significant',
      5: 'Severe'
    };
    return labels[level] || 'Unknown';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Patient Assessment</h2>
            <p className="text-blue-100 mt-1">{patientName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {!loading && !error && assessment && (
            <div className="space-y-6">
              {/* Demographics Section */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Demographics & Lifestyle
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Age Group</p>
                    <p className="font-medium text-gray-900">{assessment.answers.ageGroup}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Occupation</p>
                    <p className="font-medium text-gray-900">{assessment.answers.occupation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Lifestyle</p>
                    <p className="font-medium text-gray-900">{assessment.answers.lifestyle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Activity Level</p>
                    <p className="font-medium text-gray-900">{assessment.answers.activityLevel}</p>
                  </div>
                </div>
              </div>

              {/* Clinical Concerns */}
              <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Primary Mental Health Concerns
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {assessment.answers.concerns.map((concern, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {concern}
                    </span>
                  ))}
                </div>
                {assessment.answers.otherConcern && (
                  <div className="bg-white rounded p-3 border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Additional Notes</p>
                    <p className="text-gray-900">{assessment.answers.otherConcern}</p>
                  </div>
                )}
              </div>

              {/* Symptom Timeline */}
              <div className="bg-orange-50 rounded-lg p-5 border border-orange-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  Symptom Timeline
                </h3>
                <div className="bg-white rounded p-4 border border-orange-200">
                  <p className="text-sm text-gray-600 mb-1">Duration of Symptoms</p>
                  <p className="font-semibold text-orange-700 text-lg">{assessment.answers.duration}</p>
                </div>
              </div>

              {/* Impact Assessment */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  Daily Life Impact Assessment
                </h3>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-700 font-medium">Impact Severity</span>
                    <span className={`px-4 py-2 rounded-full font-bold ${getImpactColor(assessment.answers.impactLevel)}`}>
                      {assessment.answers.impactLevel}/5 - {getImpactLabel(assessment.answers.impactLevel)}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        assessment.answers.impactLevel >= 4 ? 'bg-red-500' :
                        assessment.answers.impactLevel === 3 ? 'bg-orange-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(assessment.answers.impactLevel / 5) * 100}%` }}
                    />
                  </div>

                  <div className="mt-4 space-y-1 text-xs text-gray-600">
                    <p>• Level 1-2: Minimal impact on daily functioning</p>
                    <p>• Level 3: Moderate disruption to routine activities</p>
                    <p>• Level 4-5: Significant interference with work, relationships, or self-care</p>
                  </div>
                </div>
              </div>

              {/* Clinical Notes Section */}
              <div className="bg-green-50 rounded-lg p-5 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Clinical Recommendations</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {assessment.answers.impactLevel >= 4 && 
                    "High impact level suggests the need for immediate therapeutic intervention. Consider more frequent sessions and close monitoring."}
                  {assessment.answers.impactLevel === 3 && 
                    "Moderate impact indicates regular therapeutic support would be beneficial. Weekly or bi-weekly sessions recommended."}
                  {assessment.answers.impactLevel <= 2 && 
                    "Lower impact level suggests early intervention can be very effective. Regular check-ins and preventive strategies recommended."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!loading && !error && assessment && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Assessment Date: {new Date(assessment.createdAt).toLocaleDateString()}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <PDFDownloadLink
                document={<AssessmentPDF assessment={assessment.answers} patientName={patientName} />}
                fileName={`${patientName.replace(/\s+/g, '_')}_assessment.pdf`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {({ loading }) => (
                  <>
                    <FileText size={18} />
                    {loading ? 'Generating...' : 'Download PDF'}
                  </>
                )}
              </PDFDownloadLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
