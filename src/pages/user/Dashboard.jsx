import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { assessmentService } from '../../api/assessment';
import { AssessmentPDF } from '../../components/assessment/AssessmentPDF';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await assessmentService.getMyAssessment();
        if (response.data?.data) {
          setAssessment(response.data.data.answers);
        }
      } catch (error) {
        console.log('No assessment found or error fetching assessment');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-secondary-900">Welcome back, {user?.fullName}</h1>
      
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-secondary-900">Upcoming Appointments</h3>
          <p className="mt-2 text-secondary-500">No upcoming appointments scheduled.</p>
        </Card>
        
        <Card className="p-6 flex flex-col">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Mental Health Assessment</h3>
          {loading ? (
            <p className="text-secondary-500">Loading...</p>
          ) : assessment ? (
            <div className="flex flex-col h-full justify-between">
              <div className="mb-4">
                <p className="text-sm text-green-600 font-medium mb-2">✓ Assessment Completed</p>
                <p className="text-sm text-secondary-600">
                  You have completed your initial assessment. You can download your results below.
                </p>
              </div>
              <PDFDownloadLink
                document={<AssessmentPDF assessment={assessment} />}
                fileName="my-assessment-results.pdf"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                {({ loading }) => (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {loading ? 'Generating...' : 'Download Results'}
                  </>
                )}
              </PDFDownloadLink>
            </div>
          ) : (
            <div className="flex flex-col h-full justify-between">
              <p className="text-secondary-500 mb-4">
                Take our comprehensive assessment to get matched with the right therapist for you.
              </p>
              <Button onClick={() => navigate('/assessment')}>
                Take Assessment
              </Button>
            </div>
          )}
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-medium text-secondary-900">Messages</h3>
          <p className="mt-2 text-secondary-500">No new messages.</p>
        </Card>
      </div>
    </div>
  );
};