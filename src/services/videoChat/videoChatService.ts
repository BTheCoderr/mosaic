import { chatWebSocket } from '../websocket/chatWebSocket';
import { VerificationStatus, VideoChatRoom } from '../../models/Match';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds

class VideoChatService {
  private activeRooms: Map<string, VideoChatRoom> = new Map();
  private connectionRetries: Map<string, number> = new Map();
  private reconnectTimeouts: Map<string, NodeJS.Timeout> = new Map();

  async scheduleVerification(matchId: string, scheduledTime: Date): Promise<void> {
    try {
      const response = await this.retryOperation(() =>
        fetch(`/api/matches/${matchId}/verify/schedule`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ scheduledTime }),
        })
      );

      if (!response.ok) {
        throw new Error('Failed to schedule verification');
      }
    } catch (error) {
      console.error('Error scheduling verification:', error);
      throw new Error('Failed to schedule verification');
    }
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    attempts: number = MAX_RETRY_ATTEMPTS
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < attempts; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (i < attempts - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError;
  }

  async getVerificationStatus(matchId: string): Promise<{
    status: VerificationStatus;
    scheduledTime?: Date;
    room?: VideoChatRoom;
  }> {
    try {
      const response = await fetch(`/api/matches/${matchId}/verify/status`);
      if (!response.ok) {
        throw new Error('Failed to get verification status');
      }

      const data = await response.json();
      return {
        status: data.status,
        scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : undefined,
        room: this.activeRooms.get(matchId),
      };
    } catch (error) {
      console.error('Error getting verification status:', error);
      throw new Error('Failed to get verification status');
    }
  }

  async joinRoom(matchId: string, userId: string): Promise<void> {
    try {
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

      this.setupConnectionMonitoring(matchId, userId);
      await chatWebSocket.joinVideoChat(matchId, userId);
      
      // Reset retry count on successful connection
      this.connectionRetries.set(matchId, 0);
    } catch (error) {
      console.error('Error joining video chat room:', error);
      await this.handleConnectionError(matchId, userId);
    }
  }

  private setupConnectionMonitoring(matchId: string, userId: string) {
    chatWebSocket.on('disconnect', () => this.handleDisconnection(matchId, userId));
    chatWebSocket.on('connect', () => this.handleReconnection(matchId, userId));
  }

  private async handleConnectionError(matchId: string, userId: string) {
    const retries = this.connectionRetries.get(matchId) || 0;
    
    if (retries < MAX_RETRY_ATTEMPTS) {
      this.connectionRetries.set(matchId, retries + 1);
      
      const timeout = setTimeout(
        () => this.joinRoom(matchId, userId),
        RETRY_DELAY * Math.pow(2, retries)
      );
      
      this.reconnectTimeouts.set(matchId, timeout);
    } else {
      this.handleVerificationFailure(matchId);
    }
  }

  private async handleDisconnection(matchId: string, userId: string) {
    const room = this.activeRooms.get(matchId);
    if (room) {
      room.status = 'waiting';
      await this.handleConnectionError(matchId, userId);
    }
  }

  private async handleReconnection(matchId: string, userId: string) {
    const timeout = this.reconnectTimeouts.get(matchId);
    if (timeout) {
      clearTimeout(timeout);
      this.reconnectTimeouts.delete(matchId);
    }

    const room = this.activeRooms.get(matchId);
    if (room) {
      room.status = 'active';
      await chatWebSocket.joinVideoChat(matchId, userId);
    }
  }

  private async handleVerificationFailure(matchId: string) {
    try {
      const response = await fetch(`/api/matches/${matchId}/verify/fail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to mark verification as failed');
      }

      // Clean up room state
      this.activeRooms.delete(matchId);
      this.connectionRetries.delete(matchId);
      const timeout = this.reconnectTimeouts.get(matchId);
      if (timeout) {
        clearTimeout(timeout);
        this.reconnectTimeouts.delete(matchId);
      }
    } catch (error) {
      console.error('Error handling verification failure:', error);
    }
  }

  leaveRoom(matchId: string, userId: string): void {
    try {
      const room = this.activeRooms.get(matchId);
      if (room) {
        room.participants = room.participants.filter(id => id !== userId);
        if (room.participants.length === 0) {
          this.activeRooms.delete(matchId);
        }
      }

      chatWebSocket.leaveVideoChat(matchId);
    } catch (error) {
      console.error('Error leaving video chat room:', error);
    }
  }

  async verifyUser(matchId: string, userId: string): Promise<void> {
    try {
      const response = await fetch(`/api/matches/${matchId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify user');
      }

      chatWebSocket.sendVideoVerification(matchId);
    } catch (error) {
      console.error('Error verifying user:', error);
      throw new Error('Failed to verify user');
    }
  }

  getRoomStatus(matchId: string): 'waiting' | 'active' | 'completed' | 'failed' | undefined {
    return this.activeRooms.get(matchId)?.status;
  }

  isUserInRoom(matchId: string, userId: string): boolean {
    const room = this.activeRooms.get(matchId);
    return room ? room.participants.includes(userId) : false;
  }

  getParticipants(matchId: string): string[] {
    return this.activeRooms.get(matchId)?.participants || [];
  }
}

export const videoChatService = new VideoChatService(); 