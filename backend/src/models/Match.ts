import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './User';
import { Message } from './Message';

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

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.matches)
  user1: User;

  @ManyToOne(() => User, user => user.matches)
  user2: User;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.PENDING,
  })
  status: MatchStatus;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.NOT_STARTED,
  })
  verificationStatus: VerificationStatus;

  @Column({ nullable: true })
  scheduledVerificationTime: Date;

  @Column({ default: false })
  user1Verified: boolean;

  @Column({ default: false })
  user2Verified: boolean;

  @Column({ default: false })
  user1Liked: boolean;

  @Column({ default: false })
  user2Liked: boolean;

  @OneToMany(() => Message, message => message.match)
  messages: Message[];

  @Column({ nullable: true })
  unmatchedAt: Date;

  @Column({ nullable: true })
  lastMessageAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper method to check if it's a mutual match
  isMutualMatch(): boolean {
    return this.user1Liked && this.user2Liked;
  }

  // Helper method to check if verification is complete
  isVerificationComplete(): boolean {
    return this.user1Verified && this.user2Verified;
  }

  // Helper method to get the other user in the match
  getOtherUser(userId: string): User {
    return this.user1.id === userId ? this.user2 : this.user1;
  }

  // Helper method to check if a user can start chatting
  canStartChatting(): boolean {
    return this.status === MatchStatus.MATCHED && this.verificationStatus === VerificationStatus.COMPLETED;
  }
} 