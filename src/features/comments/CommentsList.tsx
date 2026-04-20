import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Comment } from '@/ui/Comment/Comment';
import { Loader } from '@/ui/Loader/Loader';
import { colors, spacing } from '@/theme/tokens';
import { fontFamily, fontSize } from '@/theme/typography';
import { useComments } from './useComments';

type Props = {
  postId: string;
};

export function CommentsList({ postId }: Props) {
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useComments(postId);

  const comments = data?.pages.flatMap((p) => p.comments) ?? [];

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Loader />
      </View>
    );
  }

  if (comments.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Комментариев пока нет</Text>
      </View>
    );
  }

  return (
    <View>
      {comments.map((c) => (
        <Comment
          key={c.id}
          avatarUrl={c.author.avatarUrl}
          displayName={c.author.displayName}
          text={c.text}
          createdAt={c.createdAt}
        />
      ))}
      {hasNextPage && (
        <Pressable
          onPress={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          accessibilityRole="button"
          accessibilityLabel="Показать ещё комментарии"
          style={styles.loadMore}
        >
          {isFetchingNextPage ? (
            <Loader />
          ) : (
            <Text style={styles.loadMoreText}>Показать ещё</Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  empty: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.muted,
  },
  loadMore: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  loadMoreText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
});
