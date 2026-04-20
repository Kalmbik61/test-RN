import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radii, spacing } from '@/theme/tokens';
import { fontFamily, fontSize } from '@/theme/typography';
import CommentsSvg from '../../../assets/icons/comments.svg';

export type CommentsBadgeProps = {
  count: number;
  onPress?: () => void;
  style?: ViewStyle;
};

function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

export function CommentsBadge({ count, onPress, style }: CommentsBadgeProps) {
  const content = (
    <>
      <CommentsSvg width={16} height={16} />
      <Text style={styles.count}>{formatCount(count)}</Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Comments: ${count}`}
        hitSlop={8}
        style={({ pressed }) => [styles.pill, pressed && styles.pillPressed, style]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.pill, style]} accessibilityLabel={`Comments: ${count}`}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.commentBg,
  },
  pillPressed: {
    backgroundColor: colors.likeInactiveBgPressed,
  },
  count: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    color: colors.commentIcon,
  },
});
