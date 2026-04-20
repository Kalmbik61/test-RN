import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, spacing } from '@/theme/tokens';
import { fontFamily, fontSize } from '@/theme/typography';
import { HeartIcon } from '@/ui/icons/HeartIcon';

export type LikesProps = {
  count: number;
  isLiked: boolean;
  disabled?: boolean;
  onToggle: () => void;
  style?: ViewStyle;
};

function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

export function Likes({ count, isLiked, disabled, onToggle, style }: LikesProps) {
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={isLiked ? 'Unlike' : 'Like'}
      accessibilityState={{ disabled: !!disabled, selected: isLiked }}
      hitSlop={12}
      style={({ pressed }) => [styles.row, pressed && !disabled && styles.pressed, style]}
    >
      <HeartIcon filled={isLiked} color={isLiked ? colors.primary : colors.muted} />
      <Text style={styles.count}>{formatCount(count)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
  count: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
});
