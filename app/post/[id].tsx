import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/api/types';
import type { PostsPage } from '@/api/posts';
import { CommentsBadge, Likes } from '@/ui';
import { ErrorState } from '@/ui/ErrorState/ErrorState';
import { colors, spacing } from '@/theme/tokens';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { usePost } from '@/features/post/usePost';
import { useToggleLike } from '@/features/post/useToggleLike';
import { PostHeader } from '@/features/post/PostHeader';
import { PostSkeleton } from '@/features/post/PostSkeleton';
import { useComments } from '@/features/comments/useComments';
import { CommentsList } from '@/features/comments/CommentsList';
import { CommentInput } from '@/features/comments/CommentInput';

const END_REACHED_THRESHOLD = 120;

type FeedCacheData = { pages: PostsPage[] };

function findCachedAuthor(
  qc: ReturnType<typeof useQueryClient>,
  postId: string,
): { author: PostsPage['posts'][number]['author']; createdAt: string } | null {
  const entries = qc.getQueriesData<FeedCacheData>({ queryKey: ['feed'] });
  for (const [, data] of entries) {
    const post = data?.pages.flatMap((p) => p.posts).find((p) => p.id === postId);
    if (post) return { author: post.author, createdAt: post.createdAt };
  }
  return null;
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: post, isLoading, error, refetch } = usePost(id);
  const { mutate, isPending } = useToggleLike(id);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = useComments(id);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!hasNextPage || isFetchingNextPage) return;
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const distanceFromBottom =
      contentSize.height - (contentOffset.y + layoutMeasurement.height);
    if (distanceFromBottom < END_REACHED_THRESHOLD) {
      fetchNextPage();
    }
  };

  const renderContent = () => {
    if (isLoading) return <PostSkeleton />;

    if (error) {
      const isNotFound = error instanceof ApiError && error.code === 'NOT_FOUND';
      if (isNotFound) {
        return (
          <ErrorState
            title="По вашему запросу ничего не найдено"
            retryLabel="На главную"
            onRetry={() => router.replace('/')}
          />
        );
      }
      const cachedAuthor = findCachedAuthor(qc, id);
      return (
        <>
          {cachedAuthor ? (
            <View style={styles.headerWrap}>
              <PostHeader
                author={cachedAuthor.author}
                createdAt={cachedAuthor.createdAt}
                isVerified={cachedAuthor.author.isVerified}
                variant="compact"
              />
            </View>
          ) : null}
          <ErrorState
            title="Не удалось загрузить публикацию"
            retryLabel="Повторить"
            onRetry={refetch}
          />
        </>
      );
    }

    if (!post) return null;

    if (post.tier === 'paid') {
      return (
        <ErrorState
          title="Пост доступен после доната"
          description="Откройте доступ в ленте, отправив донат автору"
          retryLabel="Назад"
          onRetry={() => router.back()}
        />
      );
    }

    return (
      <>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={200}
        >
          <View style={styles.headerWrap}>
            <PostHeader
              author={post.author}
              createdAt={post.createdAt}
              isVerified={post.author.isVerified}
              variant="compact"
            />
          </View>
          {post.coverUrl ? (
            <Image
              source={{ uri: post.coverUrl }}
              style={styles.cover}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={300}
              accessibilityLabel={`Cover image for ${post.title}`}
            />
          ) : null}
          <View style={styles.inner}>
            <Text style={styles.title}>{post.title}</Text>
            {post.body ? <Text style={styles.body}>{post.body}</Text> : null}
            <View style={styles.actions}>
              <Likes
                count={post.likesCount}
                isLiked={post.isLiked}
                disabled={isPending}
                onToggle={() => mutate()}
              />
              <CommentsBadge count={post.commentsCount} />
            </View>
            <CommentsList postId={id} totalCount={post.commentsCount} />
          </View>
        </ScrollView>
        <CommentInput postId={id} />
      </>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <Stack.Screen options={{ title: '', headerBackTitle: '' }} />
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  cover: {
    width: '100%',
    height: 393,
  },
  headerWrap: {
    paddingHorizontal: spacing.lg,
  },
  inner: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    color: colors.text,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    lineHeight: lineHeight.lg,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
