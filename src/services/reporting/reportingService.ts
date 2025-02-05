import { Alert } from 'react-native';

export enum ReportCategory {
  INAPPROPRIATE_BEHAVIOR = 'inappropriate_behavior',
  HARASSMENT = 'harassment',
  FAKE_IDENTITY = 'fake_identity',
  TECHNICAL_ISSUES = 'technical_issues',
  SAFETY_CONCERNS = 'safety_concerns',
  OTHER = 'other',
}

export interface ReportEvidence {
  type: 'screenshot' | 'recording' | 'text';
  content: string;
  timestamp: Date;
}

export interface Report {
  id: string;
  matchId: string;
  reporterId: string;
  reportedUserId: string;
  category: ReportCategory;
  description: string;
  evidence?: ReportEvidence[];
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: Date;
  updatedAt: Date;
}

class ReportingService {
  async submitReport(
    matchId: string,
    reportedUserId: string,
    category: ReportCategory,
    description: string,
    evidence?: ReportEvidence[]
  ): Promise<void> {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
          reportedUserId,
          category,
          description,
          evidence,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      Alert.alert(
        'Report Submitted',
        'Thank you for your report. Our team will review it and take appropriate action.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    }
  }

  async getReportStatus(reportId: string): Promise<Report> {
    try {
      const response = await fetch(`/api/reports/${reportId}`);
      if (!response.ok) {
        throw new Error('Failed to get report status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting report status:', error);
      throw error;
    }
  }

  async addEvidenceToReport(reportId: string, evidence: ReportEvidence): Promise<void> {
    try {
      const response = await fetch(`/api/reports/${reportId}/evidence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evidence),
      });

      if (!response.ok) {
        throw new Error('Failed to add evidence to report');
      }
    } catch (error) {
      console.error('Error adding evidence to report:', error);
      throw error;
    }
  }

  async updateReportStatus(
    reportId: string,
    status: Report['status'],
    notes?: string
  ): Promise<void> {
    try {
      const response = await fetch(`/api/reports/${reportId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to update report status');
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      throw error;
    }
  }

  // Safety features
  async blockUser(userId: string): Promise<void> {
    try {
      const response = await fetch(`/api/users/${userId}/block`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to block user');
      }

      Alert.alert('User Blocked', 'The user has been blocked successfully.');
    } catch (error) {
      console.error('Error blocking user:', error);
      Alert.alert('Error', 'Failed to block user. Please try again.');
    }
  }

  async reportEmergency(matchId: string, details: string): Promise<void> {
    try {
      const response = await fetch('/api/reports/emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
          details,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit emergency report');
      }

      Alert.alert(
        'Emergency Report Submitted',
        'Our team has been notified and will take immediate action.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error submitting emergency report:', error);
      Alert.alert('Error', 'Failed to submit emergency report. Please contact support directly.');
    }
  }

  // Helper methods
  getReportCategories(): { value: ReportCategory; label: string }[] {
    return [
      { value: ReportCategory.INAPPROPRIATE_BEHAVIOR, label: 'Inappropriate Behavior' },
      { value: ReportCategory.HARASSMENT, label: 'Harassment' },
      { value: ReportCategory.FAKE_IDENTITY, label: 'Fake Identity' },
      { value: ReportCategory.TECHNICAL_ISSUES, label: 'Technical Issues' },
      { value: ReportCategory.SAFETY_CONCERNS, label: 'Safety Concerns' },
      { value: ReportCategory.OTHER, label: 'Other' },
    ];
  }
}

export const reportingService = new ReportingService(); 