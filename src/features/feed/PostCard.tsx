import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { Post } from '@/api/posts';
import { Likes } from '@/ui';
import { colors, spacing } from '@/theme/tokens';
import { fontFamily, fontSize } from '@/theme/typography';
import { useToggleLike } from '@/features/post/useToggleLike';

export function PostCard({ post, onPress }: { post: Post; onPress: () => void }) {
  const { mutate, isPending } = useToggleLike(post.id);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open post ${post.title}`}
      style={styles.card}
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
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {post.title}
        </Text>
        <Text style={styles.preview} numberOfLines={3}>
          {post.preview}
        </Text>
        <Likes
          count={post.likesCount}
          isLiked={post.isLiked}
          disabled={isPending}
          onToggle={() => mutate()}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cover: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  preview: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.muted,
  },
});
