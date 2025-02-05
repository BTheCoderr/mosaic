import { store } from '../../store/store'
import { addMessage } from '../../store/slices/chatSlice'
import { Message } from '../../store/slices/chatSlice'

const WS_URL = process.env.WS_URL || 'ws://localhost:3000'

class ChatWebSocket {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout = 1000 // Start with 1 second

  connect() {
    try {
      this.ws = new WebSocket(WS_URL)
      this.setupEventListeners()
    } catch (error) {
      console.error('WebSocket connection error:', error)
      this.handleReconnect()
    }
  }

  private setupEventListeners() {
    if (!this.ws) return

    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
      this.reconnectTimeout = 1000
      
      // Send authentication token
      const token = store.getState().auth.token
      if (token) {
        this.send({
          type: 'auth',
          token,
        })
      }
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.handleMessage(data)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    this.ws.onclose = () => {
      console.log('WebSocket disconnected')
      this.handleReconnect()
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
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

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  sendMessage(chatId: string, message: Omit<Message, 'id' | 'timestamp' | 'read'>) {
    this.send({
      type: 'message',
      chatId,
      message,
    })
  }

  sendTyping(chatId: string, isTyping: boolean) {
    this.send({
      type: 'typing',
      chatId,
      isTyping,
    })
  }

  sendRead(chatId: string, messageId: string) {
    this.send({
      type: 'read',
      chatId,
      messageId,
    })
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

export const chatWebSocket = new ChatWebSocket() 