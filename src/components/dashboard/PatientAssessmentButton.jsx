import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FileText, Loader } from 'lucide-react';
import { AssessmentPDF } from '../assessment/AssessmentPDF';
import {
  fetchAssessmentByPatientId,
  selectPatientAssessment,
  selectLoading,
  selectError,
} from '../../store/slices/assessmentSlice';

export const PatientAssessmentButton = ({ patientId, patientName }) => {
  const dispatch = useDispatch();
  const patientAssessment = useSelector(selectPatientAssessment);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  
  const [ready, setReady] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    // Reset when patientId changes
    setReady(false);
    setLocalError(null);
  }, [patientId]);

  const fetchAssessment = async () => {
    if (patientAssessment && ready) return; // Already fetched
    
    setLocalError(null);
    try {
      await dispatch(fetchAssessmentByPatientId(patientId)).unwrap();
      setReady(true);
    } catch (err) {
      console.error("Error fetching assessment:", err);
      setLocalError("No assessment found");
    }
  };

  if (localError || error.fetch) {
    return <span className="text-xs text-gray-400" title={localError || error.fetch}>No Assessment</span>;
  }

  if (ready && patientAssessment) {
    return (
      <PDFDownloadLink
        document={<AssessmentPDF assessment={patientAssessment.answers} patientName={patientName} />}
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
      disabled={loading.fetch}
      className="text-xs flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
    >
      {loading.fetch ? <Loader size={14} className="animate-spin" /> : <FileText size={14} />}
      {loading.fetch ? 'Loading...' : 'View Assessment'}
    </button>
  );
};
