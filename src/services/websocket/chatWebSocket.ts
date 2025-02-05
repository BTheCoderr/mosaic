import { io, Socket } from 'socket.io-client';
import { store } from '../../store/store'
import { addMessage } from '../../store/slices/chatSlice'
import { Message } from '../../store/slices/chatSlice'

const WS_URL = process.env.WS_URL || 'ws://localhost:3000'

type VideoChatEventCallback = (data: any) => void;

class ChatWebSocket {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout = 1000 // Start with 1 second
  private videoChatCallbacks: Map<string, VideoChatEventCallback> = new Map()

  connect() {
    try {
      this.socket = io(WS_URL, {
        transports: ['websocket'],
        autoConnect: true,
      })
      this.setupEventListeners()
    } catch (error) {
      console.error('WebSocket connection error:', error)
      this.handleReconnect()
    }
  }

  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
      this.reconnectTimeout = 1000
      
      // Send authentication token
      const token = store.getState().auth.token
      if (token) {
        this.emit('auth', { token })
      }
    })

    this.socket.on('message', (data) => {
      try {
        this.handleMessage(data)
      } catch (error) {
        console.error('Error handling message:', error)
      }
    })

    // Video chat events
    this.socket.on('videoChat:signal', (data) => {
      const callback = this.videoChatCallbacks.get('signal')
      if (callback) callback(data)
    })

    this.socket.on('videoChat:status', (data) => {
      const callback = this.videoChatCallbacks.get('status')
      if (callback) callback(data)
    })

    this.socket.on('videoChat:completed', (data) => {
      const callback = this.videoChatCallbacks.get('completed')
      if (callback) callback(data)
    })

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
      this.handleReconnect()
    })

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error)
    })
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Reconnecting attempt ${this.reconnectAttempts}...`)
      
      setTimeout(() => {
        this.connect()
      }, this.reconnectTimeout)
      
      // Exponential backoff
      this.reconnectTimeout *= 2
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'message':
        store.dispatch(addMessage({
          chatId: data.chatId,
          message: data.message,
        }))
        break
      case 'typing':
        // Handle typing indicator
        break
      case 'read':
        // Handle read receipts
        break
      default:
        console.warn('Unknown message type:', data.type)
    }
  }

  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  // Video chat methods
  onVideoSignal(callback: VideoChatEventCallback) {
    this.videoChatCallbacks.set('signal', callback)
  }

  onVideoStatus(callback: VideoChatEventCallback) {
    this.videoChatCallbacks.set('status', callback)
  }

  onVideoCompleted(callback: VideoChatEventCallback) {
    this.videoChatCallbacks.set('completed', callback)
  }

  joinVideoChat(matchId: string, userId: string) {
    this.emit('videoChat:join', { matchId, userId })
  }

  sendVideoSignal(data: any) {
    this.emit('videoChat:signal', data)
  }

  sendVideoVerification(matchId: string) {
    this.emit('videoChat:verify', { matchId })
  }

  leaveVideoChat(matchId: string) {
    this.emit('videoChat:leave', { matchId })
  }

  // Regular chat methods
  sendMessage(chatId: string, message: Omit<Message, 'id' | 'timestamp' | 'read'>) {
    this.emit('message', {
      type: 'message',
      chatId,
      message,
    })
  }

  sendTyping(chatId: string, isTyping: boolean) {
    this.emit('typing', {
      type: 'typing',
      chatId,
      isTyping,
    })
  }

  sendRead(chatId: string, messageId: string) {
    this.emit('read', {
      type: 'read',
      chatId,
      messageId,
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }
}

export const chatWebSocket = new ChatWebSocket() 