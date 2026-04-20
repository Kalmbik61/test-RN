import { ScrollView, StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ApiError } from '@/api/types';
import { Likes } from '@/ui';
import { ErrorState } from '@/ui/ErrorState/ErrorState';
import { Button } from '@/ui/Button/Button';
import { colors, spacing } from '@/theme/tokens';
import { usePost } from '@/features/post/usePost';
import { useToggleLike } from '@/features/post/useToggleLike';
import { PostHeader } from '@/features/post/PostHeader';
import { PostBody } from '@/features/post/PostBody';
import { PostSkeleton } from '@/features/post/PostSkeleton';
import { CommentsList } from '@/features/comments/CommentsList';
import { CommentInput } from '@/features/comments/CommentInput';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: post, isLoading, error, refetch } = usePost(id);
  const { mutate, isPending } = useToggleLike(id);

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: '', headerBackTitle: '' }} />
        <PostSkeleton />
      </>
    );
  }

  if (error) {
    const isNotFound =
      error instanceof ApiError && error.code === 'NOT_FOUND';

    return (
      <>
        <Stack.Screen options={{ title: '', headerBackTitle: '' }} />
        <ErrorState
          title={isNotFound ? 'Пост не найден' : 'Ошибка загрузки'}
          description={isNotFound ? undefined : error.message}
          onRetry={isNotFound ? undefined : refetch}
          retryLabel="Повторить"
          style={styles.errorState}
        />
        {isNotFound ? (
          <View style={styles.backButton}>
            <Button
              title="Назад"
              onPress={() => router.back()}
              accessibilityLabel="Назад"
            />
          </View>
        ) : null}
      </>
    );
  }

  if (!post) return null;

  return (
    <>
      <Stack.Screen options={{ title: '', headerBackTitle: '' }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
          <PostHeader
            author={post.author}
            createdAt={post.createdAt}
            isVerified={post.author.isVerified}
          />
          <Likes
            count={post.likesCount}
            isLiked={post.isLiked}
            disabled={isPending}
            onToggle={() => mutate()}
          />
          <PostBody post={post} />
          <CommentsList postId={id} />
        </View>
      </ScrollView>
      <CommentInput postId={id} />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  cover: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  inner: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  errorState: {
    flex: 1,
  },
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
});
