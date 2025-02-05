import { Server } from 'socket.io';
import { redis } from '../../config/redis';
import { Match, VerificationStatus } from '../../models/Match';
import { AppDataSource } from '../../config/database';

const matchRepository = AppDataSource.getRepository(Match);

interface VideoChatRoom {
  matchId: string;
  participants: string[];
  startTime: Date;
  status: 'waiting' | 'active' | 'completed' | 'failed';
}

export class VideoChatService {
  private io: Server;
  private activeRooms: Map<string, VideoChatRoom> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      // Join video chat room
      socket.on('videoChat:join', async (data: { matchId: string; userId: string }) => {
        try {
          const { matchId, userId } = data;
          const match = await matchRepository.findOne({
            where: { id: matchId },
            relations: ['user1', 'user2'],
          });

          if (!match) {
            socket.emit('videoChat:error', { message: 'Match not found' });
            return;
          }

          // Verify user is part of the match
          if (match.user1.id !== userId && match.user2.id !== userId) {
            socket.emit('videoChat:error', { message: 'Unauthorized' });
            return;
          }

          const roomId = `videoChat:${matchId}`;
          socket.join(roomId);

          let room = this.activeRooms.get(matchId);
          if (!room) {
            room = {
              matchId,
              participants: [userId],
              startTime: new Date(),
              status: 'waiting',
            };
            this.activeRooms.set(matchId, room);
          } else {
            room.participants.push(userId);
            room.status = 'active';
          }

          // Notify room status
          this.io.to(roomId).emit('videoChat:status', {
            status: room.status,
            participants: room.participants,
          });

          // Handle WebRTC signaling
          socket.on('videoChat:signal', (signalData: any) => {
            socket.to(roomId).emit('videoChat:signal', signalData);
          });

          // Handle verification confirmation
          socket.on('videoChat:verify', async () => {
            const isUser1 = match.user1.id === userId;
            if (isUser1) {
              match.user1Verified = true;
            } else {
              match.user2Verified = true;
            }

            if (match.isVerificationComplete()) {
              match.verificationStatus = VerificationStatus.COMPLETED;
              room.status = 'completed';
              this.io.to(roomId).emit('videoChat:completed');
            }

            await matchRepository.save(match);
          });

          // Handle disconnection
          socket.on('disconnect', () => {
            if (room) {
              room.participants = room.participants.filter(id => id !== userId);
              if (room.participants.length === 0) {
                this.activeRooms.delete(matchId);
              }
            }
          });
        } catch (error) {
          console.error('Video chat error:', error);
          socket.emit('videoChat:error', { message: 'Failed to join video chat' });
        }
      });
    });
  }

  async scheduleVerification(matchId: string, scheduledTime: Date): Promise<void> {
    try {
      const match = await matchRepository.findOne({
        where: { id: matchId },
      });

      if (!match) {
        throw new Error('Match not found');
      }

      match.scheduledVerificationTime = scheduledTime;
      match.verificationStatus = VerificationStatus.SCHEDULED;
      await matchRepository.save(match);

      // Set reminder in Redis (15 minutes before)
      const reminderTime = new Date(scheduledTime.getTime() - 15 * 60 * 1000);
      await redis.set(
        `verification:reminder:${matchId}`,
        JSON.stringify({ matchId, scheduledTime }),
        'EXAT',
        Math.floor(reminderTime.getTime() / 1000)
      );
    } catch (error) {
      console.error('Error scheduling verification:', error);
      throw new Error('Failed to schedule verification');
    }
  }

  async getVerificationStatus(matchId: string): Promise<{
    status: VerificationStatus;
    scheduledTime?: Date;
    room?: VideoChatRoom;
  }> {
    try {
      const match = await matchRepository.findOne({
        where: { id: matchId },
      });

      if (!match) {
        throw new Error('Match not found');
      }

      return {
        status: match.verificationStatus,
        scheduledTime: match.scheduledVerificationTime,
        room: this.activeRooms.get(matchId),
      };
    } catch (error) {
      console.error('Error getting verification status:', error);
      throw new Error('Failed to get verification status');
    }
  }
} 