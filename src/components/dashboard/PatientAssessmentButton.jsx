import React, { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FileText, Loader } from 'lucide-react';
import { assessmentService } from '../../api/assessment';
import { AssessmentPDF } from '../assessment/AssessmentPDF';

export const PatientAssessmentButton = ({ patientId, patientName }) => {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  const fetchAssessment = async () => {
    if (assessment) return; // Already fetched
    
    setLoading(true);
    setError(null);
    try {
      const response = await assessmentService.getAssessmentByPatientId(patientId);
      setAssessment(response.data.data);
      setReady(true);
    } catch (err) {
      console.error("Error fetching assessment:", err);
      setError("No assessment found");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <span className="text-xs text-gray-400" title={error}>No Assessment</span>;
  }

  if (ready && assessment) {
    return (
      <PDFDownloadLink
        document={<AssessmentPDF assessment={assessment.answers} patientName={patientName} />}
        fileName={`${patientName.replace(/\s+/g, '_')}_assessment.pdf`}
        className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800"
        onClick={(e) => e.stopPropagation()}
      >
        {({ loading: pdfLoading }) => (
          <>
            <FileText size={14} />
            {pdfLoading ? 'Generating...' : 'Download Report'}
          </>
        )}
      </PDFDownloadLink>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        fetchAssessment();
      }}
      disabled={loading}
      className="text-xs flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
    >
      {loading ? <Loader size={14} className="animate-spin" /> : <FileText size={14} />}
      {loading ? 'Loading...' : 'View Assessment'}
    </button>
  );
};
