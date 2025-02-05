import React from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../../../theme/ThemeProvider'
import { useAppSelector } from '../../../store/store'

interface ChatPreview {
  id: string
  userName: string
  lastMessage: string
  timestamp: number
  unreadCount: number
  avatar: string
}

// Dummy data
const DUMMY_CHATS: ChatPreview[] = [
  {
    id: '1',
    userName: 'Sarah',
    lastMessage: 'Hey, how are you?',
    timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    unreadCount: 2,
    avatar: 'https://picsum.photos/100/100',
  },
  {
    id: '2',
    userName: 'Mike',
    lastMessage: 'Want to grab coffee sometime?',
    timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
    unreadCount: 0,
    avatar: 'https://picsum.photos/100/101',
  },
  // Add more dummy chats
]

const ChatListScreen = () => {
  const navigation = useNavigation()
  const { colors, spacing } = useTheme()

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp

    if (diff < 1000 * 60) {
      return 'Just now'
    } else if (diff < 1000 * 60 * 60) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes}m ago`
    } else if (diff < 1000 * 60 * 60 * 24) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      return `${hours}h ago`
    } else {
      return new Date(timestamp).toLocaleDateString()
    }
  }

  const renderChatItem = ({ item }: { item: ChatPreview }) => (
    <TouchableOpacity
      style={[
        styles.chatItem,
        { borderBottomColor: colors.gray[200] },
      ]}
      onPress={() => navigation.navigate('ChatRoom', {
        chatId: item.id,
        userName: item.userName,
      })}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={[styles.userName, { color: colors.text.primary }]}>
            {item.userName}
          </Text>
          <Text style={[styles.timestamp, { color: colors.text.secondary }]}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
        
        <View style={styles.lastMessageContainer}>
          <Text
            style={[
              styles.lastMessage,
              { color: colors.text.secondary },
            ]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          
          {item.unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary.main }]}>
              <Text style={styles.unreadCount}>
                {item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
        No conversations yet
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.text.secondary }]}>
        Start matching with people to chat!
      </Text>
    </View>
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background.light }]}>
      <FlatList
        data={DUMMY_CHATS}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={styles.listContent}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
})

export default ChatListScreen 