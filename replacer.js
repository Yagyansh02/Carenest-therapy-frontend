const fs = require('fs'); 
let c = fs.readFileSync('src/pages/supervisor/TherapistDetailedReport.jsx', 'utf8'); 
const start = c.indexOf('  const fetchTherapistData = async () => {'); 
const end = c.indexOf('  const renderStars = (rating) => {'); 
if (start !== -1 && end !== -1) { 
  const replaceWith = \  const fetchTherapistData = async () => {
    try {
      setLoading(true);

      const therapistResponse = await therapistService.getTherapistById(therapistId);
      const therapistData = therapistResponse.data.data;
      setTherapist(therapistData);

      const therapistUserId = therapistData.userId?._id || therapistData.userId;

      const sessionsResponse = await supervisorService.getStudentSessions(therapistUserId, 1, 100);
      const sessionsWithFeedback = sessionsResponse.data.data.sessions || [];

      setSessions(sessionsWithFeedback);

      const initialFeedbackData = {};
      let totalFeedbacksCount = 0;

      sessionsWithFeedback.forEach(session => {
        initialFeedbackData[session._id] = {
          patientToTherapist: session.patientFeedback || null,
          therapistToPatient: session.therapistFeedback || null,
          supervisorToTherapist: null 
        };
        if (session.patientFeedback) totalFeedbacksCount++;
        if (session.therapistFeedback) totalFeedbacksCount++;
      });

      setFeedbackData(initialFeedbackData);

      const completed = sessionsWithFeedback.filter(s => s.status === 'completed').length;
      setStats({
        totalSessions: sessionsWithFeedback.length,
        completedSessions: completed,
        averageRating: therapistData.averageRating || 0,
        totalFeedbacks: totalFeedbacksCount
      });

    } catch (error) {
      console.error('Error fetching therapist data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSession = (sessionId) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
    } else {
      setExpandedSession(sessionId);
    }
  };

\;
  c = c.substring(0, start) + replaceWith + c.substring(end); 
  fs.writeFileSync('src/pages/supervisor/TherapistDetailedReport.jsx', c); 
  console.log('Replaced successfully'); 
} else { 
  console.log('Could not find boundaries'); 
}
