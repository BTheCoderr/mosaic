import { Server, Socket } from 'socket.io';
import { verifyToken } from '../../middleware/auth';
import { AppDataSource } from '../../config/database';
import { User } from '../../models/User';
import { Message } from '../../models/Message';
import { Match } from '../../models/Match';
import { redis } from '../../config/redis';

const userRepository = AppDataSource.getRepository(User);
const messageRepository = AppDataSource.getRepository(Message);
const matchRepository = AppDataSource.getRepository(Match);

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const setupWebSocket = (io: Server) => {
  // Middleware to authenticate socket connections
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error('Invalid token'));
      }

      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    
    try {
      // Mark user as online
      await redis.hset('online_users', userId, socket.id);
      
      // Join user's personal room
      socket.join(`user:${userId}`);
      
      // Notify user's matches about online status
      const matches = await matchRepository.find({
        where: [
          { user1: { id: userId }, status: 'matched' },
          { user2: { id: userId }, status: 'matched' }
        ],
        relations: ['user1', 'user2']
      });

      matches.forEach(match => {
        const otherUserId = match.user1.id === userId ? match.user2.id : match.user1.id;
        io.to(`user:${otherUserId}`).emit('user:online', { userId });
      });

      // Handle new messages
      socket.on('message:send', async (data: { matchId: string; content: string }) => {
        try {
          const match = await matchRepository.findOne({
            where: { id: data.matchId },
            relations: ['user1', 'user2']
          });

          if (!match) {
            throw new Error('Match not found');
          }

          const receiverId = match.user1.id === userId ? match.user2.id : match.user1.id;

          const message = new Message();
          message.match = match;
          message.sender = { id: userId } as User;
          message.receiver = { id: receiverId } as User;
          message.content = data.content;

          const savedMessage = await messageRepository.save(message);

          // Send message to both users
          io.to(`user:${userId}`).to(`user:${receiverId}`).emit('message:new', savedMessage);
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing:start', async (data: { matchId: string }) => {
        const match = await matchRepository.findOne({
          where: { id: data.matchId },
          relations: ['user1', 'user2']
        });

        if (match) {
          const receiverId = match.user1.id === userId ? match.user2.id : match.user1.id;
          io.to(`user:${receiverId}`).emit('typing:start', { userId, matchId: data.matchId });
        }
      });

      socket.on('typing:stop', async (data: { matchId: string }) => {
        const match = await matchRepository.findOne({
          where: { id: data.matchId },
          relations: ['user1', 'user2']
        });

        if (match) {
          const receiverId = match.user1.id === userId ? match.user2.id : match.user1.id;
          io.to(`user:${receiverId}`).emit('typing:stop', { userId, matchId: data.matchId });
        }
      });

      // Handle read receipts
      socket.on('message:read', async (data: { messageId: string }) => {
        try {
          const message = await messageRepository.findOne({
            where: { id: data.messageId },
            relations: ['sender']
          });

          if (message && !message.read) {
            message.markAsRead();
            await messageRepository.save(message);

            // Notify sender that message was read
            io.to(`user:${message.sender.id}`).emit('message:read', {
              messageId: message.id,
              readAt: message.readAt
            });
          }
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      });

      // Handle disconnection
      socket.on('disconnect', async () => {
        // Mark user as offline
        await redis.hdel('online_users', userId);

        // Notify user's matches about offline status
        matches.forEach(match => {
          const otherUserId = match.user1.id === userId ? match.user2.id : match.user1.id;
          io.to(`user:${otherUserId}`).emit('user:offline', { userId });
        });
      });
    } catch (error) {
      console.error('WebSocket connection error:', error);
      socket.disconnect();
    }
  });
}; 