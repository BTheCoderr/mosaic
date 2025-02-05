import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../theme/ThemeProvider';
import { useAppSelector } from '../../../store/store';
import { MatchStatus, VerificationStatus } from '../../../models/Match';

interface MatchPreview {
  id: string;
  userName: string;
  avatar: string;
  matchStatus: MatchStatus;
  verificationStatus: VerificationStatus;
  lastActive: Date;
}

const MatchesScreen = () => {
  const navigation = useNavigation();
  const { colors, spacing } = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);
  const [matches, setMatches] = React.useState<MatchPreview[]>([]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // TODO: Fetch matches from API
      // const response = await matchService.getMatches();
      // setMatches(response);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleMatchPress = (matchId: string, userName: string) => {
    navigation.navigate('ChatRoom', { chatId: matchId, userName });
  };

  const renderMatchItem = ({ item }: { item: MatchPreview }) => (
    <TouchableOpacity
      style={[
        styles.matchItem,
        { backgroundColor: colors.background.surface, borderColor: colors.gray[200] },
      ]}
      onPress={() => handleMatchPress(item.id, item.userName)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.verificationStatus === 'completed' && (
          <View
            style={[
              styles.verifiedBadge,
              { backgroundColor: colors.status.success },
            ]}
          >
            <Icon name="checkmark" size={12} color={colors.common.white} />
          </View>
        )}
      </View>

      <View style={styles.matchInfo}>
        <Text style={[styles.userName, { color: colors.text.primary }]}>
          {item.userName}
        </Text>
        <Text style={[styles.lastActive, { color: colors.text.secondary }]}>
          Last active {new Date(item.lastActive).toLocaleDateString()}
        </Text>
      </View>

      <Icon
        name="chevron-forward"
        size={24}
        color={colors.gray[400]}
        style={styles.chevron}
      />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="heart-outline" size={64} color={colors.gray[400]} />
      <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
        No Matches Yet
      </Text>
      <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
        Keep swiping to find your perfect match!
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background.light }]}>
      <FlatList
        data={matches}
        renderItem={renderMatchItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  lastActive: {
    fontSize: 14,
  },
  chevron: {
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MatchesScreen; 