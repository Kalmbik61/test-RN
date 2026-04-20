import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/ui/Skeleton/Skeleton';
import { colors, spacing, radii } from '@/theme/tokens';

function PostCardSkeleton() {
  return (
    <View style={styles.card} accessibilityLabel="Loading post">
      {/* Cover image placeholder */}
      <Skeleton height={180} borderRadius={radii.md} style={styles.cover} />
      {/* Title line */}
      <Skeleton height={16} width="80%" style={styles.line} />
      {/* Subtitle line */}
      <Skeleton height={12} width="55%" style={styles.lineShort} />
    </View>
  );
}

export function FeedSkeleton() {
  return (
    <View>
      <PostCardSkeleton />
      <PostCardSkeleton />
      <PostCardSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  cover: {
    marginBottom: spacing.md,
  },
  line: {
    marginBottom: spacing.sm,
  },
  lineShort: {
    marginBottom: spacing.xs,
  },
});
