import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { Match } from './Match';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Match, match => match.messages)
  match: Match;

  @ManyToOne(() => User, user => user.messages)
  sender: User;

  @ManyToOne(() => User, user => user.messages)
  receiver: User;

  @Column('text')
  content: string;

  @Column({ default: false })
  read: boolean;

  @Column({ nullable: true })
  readAt: Date;

  @Column({ default: false })
  deleted: boolean;

  @Column({ nullable: true })
  deletedAt: Date;

  @Column({ nullable: true })
  deletedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper method to mark message as read
  markAsRead() {
    this.read = true;
    this.readAt = new Date();
  }

  // Helper method to soft delete message
  softDelete(userId: string) {
    this.deleted = true;
    this.deletedAt = new Date();
    this.deletedBy = userId;
  }
} 