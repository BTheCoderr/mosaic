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
  MATCHED = 'matched',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
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

  // Helper method to get the other user in the match
  getOtherUser(userId: string): User {
    return this.user1.id === userId ? this.user2 : this.user1;
  }
} 