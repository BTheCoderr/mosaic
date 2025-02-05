export enum MatchStatus {
  PENDING = 'pending',
  PENDING_VERIFICATION = 'pending_verification',
  VERIFIED = 'verified',
  MATCHED = 'matched',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum VerificationStatus {
  NOT_STARTED = 'not_started',
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  status: MatchStatus;
  verificationStatus: VerificationStatus;
  scheduledVerificationTime?: Date;
  user1Verified: boolean;
  user2Verified: boolean;
  user1Liked: boolean;
  user2Liked: boolean;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchWithProfiles extends Match {
  user1Profile: any; // Replace with actual Profile type
  user2Profile: any; // Replace with actual Profile type
}

export interface MatchWithDetails extends MatchWithProfiles {
  insights: string[];
  eventSuggestions: string[];
}

export interface VideoChatRoom {
  matchId: string;
  participants: string[];
  startTime: Date;
  status: 'waiting' | 'active' | 'completed' | 'failed';
}

export interface VerificationSchedule {
  matchId: string;
  scheduledTime: Date;
  participants: string[];
  reminderSent: boolean;
}

export interface VerificationResult {
  matchId: string;
  verifiedAt: Date;
  verifiedBy: string[];
  success: boolean;
  notes?: string;
} 