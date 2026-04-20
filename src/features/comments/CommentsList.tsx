import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Comment } from '@/ui/Comment/Comment';
import { Loader } from '@/ui/Loader/Loader';
import { colors, spacing } from '@/theme/tokens';
import { fontFamily, fontSize } from '@/theme/typography';
import { useComments } from './useComments';

type Props = {
  postId: string;
  totalCount?: number;
};

type SortOrder = 'newest' | 'oldest';

type LikeState = { liked: boolean; delta: number };

function pluralize(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'комментарий';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'комментария';
  return 'комментариев';
}

export function CommentsList({ postId, totalCount }: Props) {
  const { data, isLoading, isFetchingNextPage } = useComments(postId);

  const [sort, setSort] = useState<SortOrder>('oldest');
  const [likes, setLikes] = useState<Record<string, LikeState>>({});

  const comments = useMemo(() => {
    const flat = data?.pages.flatMap((p) => p.comments) ?? [];
    const sorted = [...flat].sort((a, b) => {
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sort === 'newest' ? diff : -diff;
    });
    return sorted;
  }, [data, sort]);

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

  const toggleLike = (id: string) =>
    setLikes((prev) => {
      const cur = prev[id] ?? { liked: false, delta: 0 };
      return {
        ...prev,
        [id]: { liked: !cur.liked, delta: cur.liked ? cur.delta - 1 : cur.delta + 1 },
      };
    });

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerCount}>
          {totalCount ?? comments.length} {pluralize(totalCount ?? comments.length)}
        </Text>
        <Pressable
          onPress={() => setSort((s) => (s === 'newest' ? 'oldest' : 'newest'))}
          accessibilityRole="button"
          accessibilityLabel="Изменить сортировку"
          hitSlop={8}
        >
          <Text style={styles.headerSort}>
            {sort === 'newest' ? 'Сначала старые' : 'Сначала новые'}
          </Text>
        </Pressable>
      </View>

      {comments.map((c) => {
        const like = likes[c.id];
        return (
          <Comment
            key={c.id}
            avatarUrl={c.author.avatarUrl}
            displayName={c.author.displayName}
            text={c.text}
            likesCount={like ? like.delta : 0}
            isLiked={like?.liked ?? false}
            onToggleLike={() => toggleLike(c.id)}
          />
        );
      })}

      {isFetchingNextPage ? (
        <View style={styles.footer}>
          <Loader />
        </View>
      ) : null}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  headerCount: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.muted,
  },
  headerSort: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    color: colors.primary,
  },
  footer: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
});
