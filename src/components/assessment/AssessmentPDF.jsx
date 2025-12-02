import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Svg, Path, Rect, Circle, G } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  coverPage: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: '#F0F4F8',
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2C5282',
    marginBottom: 20,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 18,
    color: '#4A5568',
    marginBottom: 10,
    textAlign: 'center',
  },
  coverDate: {
    fontSize: 14,
    color: '#718096',
    marginTop: 30,
  },
  header: {
    marginBottom: 25,
    borderBottomWidth: 3,
    borderBottomColor: '#3182CE',
    paddingBottom: 15,
    backgroundColor: '#EBF8FF',
    padding: 15,
    borderRadius: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C5282',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 11,
    color: '#4A5568',
    marginTop: 5,
  },
  section: {
    marginTop: 20,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#F7FAFC',
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#3182CE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2D3748',
    backgroundColor: '#E6FFFA',
    padding: 8,
    borderRadius: 3,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingVertical: 5,
  },
  label: {
    width: '35%',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  value: {
    width: '65%',
    fontSize: 11,
    color: '#4A5568',
    lineHeight: 1.5,
  },
  listItem: {
    fontSize: 11,
    marginBottom: 5,
    color: '#4A5568',
    paddingLeft: 10,
  },
  highlightBox: {
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#F56565',
  },
  impactMeter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  impactBar: {
    width: '70%',
    height: 25,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  impactFill: {
    height: '100%',
    borderRadius: 5,
  },
  impactLabel: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
  concernBadge: {
    backgroundColor: '#BEE3F8',
    padding: 6,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  concernText: {
    fontSize: 10,
    color: '#2C5282',
    fontWeight: 'bold',
  },
  concernsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  summaryBox: {
    backgroundColor: '#F0FFF4',
    padding: 15,
    borderRadius: 5,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#9AE6B4',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#22543D',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 10,
    color: '#2F855A',
    lineHeight: 1.6,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#A0AEC0',
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 30,
    right: 40,
    color: '#718096',
  },
});

// Helper function to get impact level details
const getImpactDetails = (level) => {
  const details = {
    1: { label: 'Minimal', color: '#48BB78', width: '20%' },
    2: { label: 'Mild', color: '#68D391', width: '40%' },
    3: { label: 'Moderate', color: '#F6AD55', width: '60%' },
    4: { label: 'Significant', color: '#F56565', width: '80%' },
    5: { label: 'Severe', color: '#E53E3E', width: '100%' },
  };
  return details[level] || details[3];
};

// Helper function to get duration severity
const getDurationColor = (duration) => {
  if (duration === 'More than 1 year') return '#E53E3E';
  if (duration === '6 months - 1 year') return '#F56565';
  if (duration === '1-6 months') return '#F6AD55';
  return '#68D391';
};

export const AssessmentPDF = ({ assessment, patientName }) => {
  const impactDetails = getImpactDetails(assessment.impactLevel);
  const concernCount = assessment.concerns?.length || 0;

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <View>
          <Text style={styles.coverTitle}>Mental Health</Text>
          <Text style={styles.coverTitle}>Assessment Report</Text>
          {patientName && (
            <Text style={styles.coverSubtitle}>Prepared for: {patientName}</Text>
          )}
          <Text style={styles.coverDate}>
            Generated on {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          <View style={{ marginTop: 50, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: '#718096', textAlign: 'center', maxWidth: 300 }}>
              This confidential report contains your mental health assessment results and is intended to help you 
              and your healthcare provider understand your current well-being.
            </Text>
          </View>
        </View>
      </Page>

      {/* Main Content Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Assessment Summary</Text>
          <Text style={styles.subtitle}>Confidential Mental Health Evaluation</Text>
        </View>

        {/* Executive Summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Assessment Overview</Text>
          <Text style={styles.summaryText}>
            This report summarizes your mental health assessment completed on {new Date().toLocaleDateString()}. 
            You have identified {concernCount} primary area{concernCount !== 1 ? 's' : ''} of concern, 
            with an impact level of {assessment.impactLevel}/5 on your daily life. 
            Symptoms have been present for: {assessment.duration}.
          </Text>
        </View>

        {/* Demographics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demographics & Lifestyle Profile</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Age Group:</Text>
            <Text style={styles.value}>{assessment.ageGroup}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Occupation Status:</Text>
            <Text style={styles.value}>{assessment.occupation}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Lifestyle Pattern:</Text>
            <Text style={styles.value}>{assessment.lifestyle}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Physical Activity:</Text>
            <Text style={styles.value}>{assessment.activityLevel}</Text>
          </View>
        </View>

        {/* Clinical Concerns */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Primary Mental Health Concerns</Text>
          
          <Text style={{ fontSize: 10, color: '#4A5568', marginBottom: 10 }}>
            You have identified the following areas of concern:
          </Text>

          <View style={styles.concernsGrid}>
            {assessment.concerns && assessment.concerns.map((concern, index) => (
              <View key={index} style={styles.concernBadge}>
                <Text style={styles.concernText}>{concern}</Text>
              </View>
            ))}
          </View>

          {assessment.otherConcern && (
            <View style={styles.highlightBox}>
              <Text style={styles.label}>Additional Notes:</Text>
              <Text style={styles.value}>{assessment.otherConcern}</Text>
            </View>
          )}
        </View>

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} fixed />
      </Page>

      {/* Detailed Analysis Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Detailed Analysis</Text>
        </View>

        {/* Symptom Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Symptom Timeline</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Duration:</Text>
            <Text style={[styles.value, { color: getDurationColor(assessment.duration), fontWeight: 'bold' }]}>
              {assessment.duration}
            </Text>
          </View>

          <View style={{ marginTop: 15, padding: 10, backgroundColor: '#EDF2F7', borderRadius: 5 }}>
            <Text style={{ fontSize: 9, color: '#4A5568', lineHeight: 1.5 }}>
              {assessment.duration === 'More than 1 year' && 
                'NOTE: Chronic symptoms lasting over a year may benefit from specialized long-term therapeutic support.'}
              {assessment.duration === '6 months - 1 year' && 
                'NOTE: Symptoms persisting 6-12 months suggest a need for consistent therapeutic intervention.'}
              {assessment.duration === '1-6 months' && 
                'NOTE: Recent onset symptoms may respond well to early intervention strategies.'}
              {assessment.duration === 'Less than a month' && 
                'NOTE: Early-stage symptoms identified - proactive care can help prevent escalation.'}
            </Text>
          </View>
        </View>

        {/* Impact Level Visualization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Life Impact Assessment</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Impact Severity:</Text>
            <Text style={[styles.value, { fontSize: 14, fontWeight: 'bold', color: impactDetails.color }]}>
              {assessment.impactLevel}/5 - {impactDetails.label}
            </Text>
          </View>

          <View style={styles.impactMeter}>
            <View style={styles.impactBar}>
              <View style={[styles.impactFill, { 
                width: impactDetails.width, 
                backgroundColor: impactDetails.color 
              }]} />
            </View>
            <Text style={[styles.impactLabel, { color: impactDetails.color }]}>
              {impactDetails.label}
            </Text>
          </View>

          <View style={{ marginTop: 15 }}>
            <Text style={{ fontSize: 10, color: '#2D3748', fontWeight: 'bold', marginBottom: 5 }}>
              Impact Scale Reference:
            </Text>
            <Text style={{ fontSize: 9, color: '#4A5568', marginBottom: 3, lineHeight: 1.4 }}>
              Level 1-2: Minimal impact on daily functioning
            </Text>
            <Text style={{ fontSize: 9, color: '#4A5568', marginBottom: 3, lineHeight: 1.4 }}>
              Level 3: Moderate disruption to routine activities
            </Text>
            <Text style={{ fontSize: 9, color: '#4A5568', marginBottom: 3, lineHeight: 1.4 }}>
              Level 4-5: Significant interference with work, relationships, or self-care
            </Text>
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Next Steps & Recommendations</Text>
          <Text style={styles.summaryText}>
            Based on your assessment, we recommend connecting with a licensed mental health professional 
            who specializes in {assessment.concerns?.[0] || 'your concerns'}. 
            {assessment.impactLevel >= 4 && ' Given the significant impact on your daily life, seeking support soon is encouraged.'}
            {assessment.impactLevel <= 2 && ' Early intervention can help maintain your well-being and prevent escalation.'}
          </Text>
          <Text style={[styles.summaryText, { marginTop: 10 }]}>
            Our platform has matched you with therapists who have experience in your specific areas of concern. 
            Review your recommended therapists to find the best fit for your needs.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>This report is generated by CareNest Therapy Platform • Confidential Assessment Document</Text>
          <Text style={{ marginTop: 5 }}>For support, visit our platform or contact your healthcare provider</Text>
        </View>

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};
