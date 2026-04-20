import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { Post, PostTier } from '@/api/posts';
import { EmptyState, ErrorState, Loader } from '@/ui';
import { colors, spacing } from '@/theme/tokens';
import { fontFamily, fontSize } from '@/theme/typography';
import { FeedTabs } from '@/features/feed/FeedTabs';
import { FeedSkeleton } from '@/features/feed/FeedSkeleton';
import { PostCard } from '@/features/feed/PostCard';
import { useFeed } from '@/features/feed/useFeed';

type FeedTier = PostTier | undefined;

export default function FeedScreen() {
  const router = useRouter();
  const [tier, setTier] = useState<FeedTier>(undefined);
  const [simulateError, setSimulateError] = useState(false);

  const {
    data,
    error,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useFeed(tier, simulateError);

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  const renderItem = ({ item }: { item: Post }) => (
    <PostCard post={item} onPress={() => router.push(`/post/${item.id}`)} />
  );

  const ListHeader = (
    <View>
      <FeedTabs value={tier} onChange={setTier} />
      {__DEV__ ? (
        <Pressable
          onPress={() => setSimulateError((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel="Toggle simulate error"
          style={[styles.devToggle, simulateError && styles.devToggleActive]}
        >
          <Text style={styles.devToggleText}>
            {simulateError ? '[DEV] Error ON' : '[DEV] Error OFF'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );

  const ListEmpty = isLoading ? (
    <FeedSkeleton />
  ) : error ? (
    <ErrorState
      title="Не удалось загрузить публикации"
      retryLabel="Повторить"
      onRetry={refetch}
    />
  ) : (
    <EmptyState title="Постов пока нет" />
  );

  const ListFooter = isFetchingNextPage ? <Loader size="small" style={styles.footer} /> : null;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        ItemSeparatorComponent={Separator}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        windowSize={10}
        removeClippedSubviews
        contentContainerStyle={styles.content}
        style={styles.list}
      />
    </SafeAreaView>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  list: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  content: {
    flexGrow: 1,
    paddingVertical: spacing.lg,
  },
  separator: {
    height: spacing.lg,
  },
  footer: {
    paddingVertical: spacing.md,
  },
  devToggle: {
    marginBottom: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.secondary,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  devToggleActive: {
    backgroundColor: '#ff6b6b22',
  },
  devToggleText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
});
