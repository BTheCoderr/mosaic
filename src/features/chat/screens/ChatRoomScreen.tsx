import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { useAppDispatch, useAppSelector } from '../../../store/store'
import { addMessage, markMessageAsRead } from '../../../store/slices/chatSlice'
import { useTheme } from '../../../theme/ThemeProvider'
import { chatWebSocket } from '../../../services/websocket/chatWebSocket'
import type { Message } from '../../../store/slices/chatSlice'

const ChatRoomScreen = () => {
  const route = useRoute()
  const { chatId, userName } = route.params as { chatId: string; userName: string }
  const navigation = useNavigation()
  const dispatch = useAppDispatch()
  const { colors, spacing, typography } = useTheme()
  
  const [messageText, setMessageText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const flatListRef = useRef<FlatList>(null)
  
  const messages = useAppSelector(state => state.chat.messages[chatId] || [])
  const currentUserId = useAppSelector(state => state.auth.user?.id)

  useEffect(() => {
    navigation.setOptions({
      title: userName,
    })

    // Connect to WebSocket when entering the chat room
    chatWebSocket.connect()

    return () => {
      // Disconnect when leaving the chat room
      chatWebSocket.disconnect()
    }
  }, [userName])

  useEffect(() => {
    // Mark messages as read when they appear in view
    messages.forEach(message => {
      if (!message.read && message.senderId !== currentUserId) {
        dispatch(markMessageAsRead({ chatId, messageId: message.id }))
        chatWebSocket.sendRead(chatId, message.id)
      }
    })
  }, [messages, currentUserId, chatId])

  const handleSendMessage = () => {
    if (!messageText.trim() || !currentUserId) return

    const messageData = {
      text: messageText.trim(),
      senderId: currentUserId,
      receiverId: 'other-user-id', // Replace with actual receiver ID
    }

    chatWebSocket.sendMessage(chatId, messageData)
    setMessageText('')
    setIsTyping(false)
    
    // Scroll to bottom
    flatListRef.current?.scrollToEnd()
  }

  const handleTyping = (text: string) => {
    setMessageText(text)

    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true)
      chatWebSocket.sendTyping(chatId, true)
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      chatWebSocket.sendTyping(chatId, false)
    }, 1500)
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === currentUserId
    
    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
          {
            backgroundColor: isOwnMessage
              ? colors.primary.main
              : colors.gray[200],
          },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            {
              color: isOwnMessage ? colors.common.white : colors.text.primary,
            },
          ]}
        >
          {item.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.timestamp,
              {
                color: isOwnMessage
                  ? colors.common.white
                  : colors.text.secondary,
              },
            ]}
          >
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {isOwnMessage && item.read && (
            <Text
              style={[
                styles.readReceipt,
                { color: colors.common.white },
              ]}
            >
              Read
            </Text>
          )}
        </View>
      </View>
    )
  }
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      
      <View style={[styles.inputContainer, { borderTopColor: colors.gray[200] }]}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.gray[100],
              color: colors.text.primary,
            },
          ]}
          value={messageText}
          onChangeText={handleTyping}
          placeholder="Type a message..."
          placeholderTextColor={colors.text.secondary}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: colors.primary.main,
              opacity: messageText.trim() ? 1 : 0.5,
            },
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <Text style={[styles.sendButtonText, { color: colors.common.white }]}>
            Send
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  readReceipt: {
    fontSize: 12,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
})

export default ChatRoomScreen 