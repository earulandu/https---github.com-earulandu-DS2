// app/(tabs)/feed/school.tsx
import React from 'react';
import { FlatList, StyleSheet, RefreshControl, View, Text, ActivityIndicator } from 'react-native';
import { PostCard } from '@/components/social/PostCard';
import { usePosts, useRealtimeUpdates } from '@/hooks/useSocialFeatures';
import { useRouter } from 'expo-router';
import { useFeed } from '@/contexts/FeedContext';

export default function SchoolFeedScreen() {
  const router = useRouter();
  const { communities, isLoading: isCommunitiesLoading, error: communitiesError } = useFeed();

  // Find the school community from the context data
  const schoolCommunityMembership = communities?.find(
    (c) => c.communities?.type === 'school'
  );
  const schoolCommunityId = schoolCommunityMembership?.communities?.id;

  const { posts, isLoading, refetch, handleVote, userVotes } = usePosts(schoolCommunityId);

  // Enable real-time updates for this community
  useRealtimeUpdates(schoolCommunityId);

  // Handle the loading state for fetching communities
  if (isCommunitiesLoading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Handle any errors that occurred while fetching communities
  if (communitiesError) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Could not load school community.</Text>
      </View>
    );
  }

  // Handle the case where the user is not part of a school community
  if (!schoolCommunityMembership) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No school community found. Please update your profile with your school.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => router.push({
              pathname: "/post/[id]", // Corrected absolute path
              params: { id: item.id }
            })}
            onVote={(voteType) => handleVote(item.id, voteType)}
            userVote={userVotes?.[item.id]}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#007AFF"
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No posts in your school community yet! Be the first to share something.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});