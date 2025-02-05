import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Message {
  id: string
  text: string
  senderId: string
  receiverId: string
  timestamp: number
  read: boolean
}

export interface Chat {
  id: string
  participants: string[]
  lastMessage?: Message
  unreadCount: number
}

interface ChatState {
  chats: Record<string, Chat>
  messages: Record<string, Message[]>
  loading: boolean
  error: string | null
}

const initialState: ChatState = {
  chats: {},
  messages: {},
  loading: false,
  error: null,
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    addChat: (state, action: PayloadAction<Chat>) => {
      state.chats[action.payload.id] = action.payload
    },
    updateChat: (state, action: PayloadAction<{ chatId: string; chat: Partial<Chat> }>) => {
      const { chatId, chat } = action.payload
      if (state.chats[chatId]) {
        state.chats[chatId] = { ...state.chats[chatId], ...chat }
      }
    },
    addMessage: (state, action: PayloadAction<{ chatId: string; message: Message }>) => {
      const { chatId, message } = action.payload
      if (!state.messages[chatId]) {
        state.messages[chatId] = []
      }
      state.messages[chatId].push(message)
      
      // Update last message in chat
      if (state.chats[chatId]) {
        state.chats[chatId].lastMessage = message
        if (!message.read) {
          state.chats[chatId].unreadCount += 1
        }
      }
    },
    markMessageAsRead: (state, action: PayloadAction<{ chatId: string; messageId: string }>) => {
      const { chatId, messageId } = action.payload
      const message = state.messages[chatId]?.find(m => m.id === messageId)
      if (message && !message.read) {
        message.read = true
        if (state.chats[chatId]) {
          state.chats[chatId].unreadCount = Math.max(0, state.chats[chatId].unreadCount - 1)
        }
      }
    },
  },
})

export const {
  setLoading,
  setError,
  addChat,
  updateChat,
  addMessage,
  markMessageAsRead,
} = chatSlice.actions

export default chatSlice.reducer 