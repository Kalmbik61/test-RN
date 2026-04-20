import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, radii, spacing } from '@/theme/tokens';
import { fontFamily, fontSize } from '@/theme/typography';
import HeartSvg from '../../../assets/icons/heart.svg';
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

const AnimatedText = Animated.createAnimatedComponent(Text);

export function Likes({ count, isLiked, disabled, onToggle, style }: LikesProps) {
  const iconScale = useSharedValue(1);
  const countScale = useSharedValue(1);
  const prevCount = useRef(count);

  useEffect(() => {
    if (prevCount.current !== count) {
      countScale.value = withSequence(
        withTiming(1.3, { duration: 120 }),
        withSpring(1, { damping: 8, stiffness: 180 }),
      );
      prevCount.current = count;
    }
  }, [count, countScale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const countStyle = useAnimatedStyle(() => ({
    transform: [{ scale: countScale.value }],
  }));

  const handlePress = () => {
    if (disabled) return;
    iconScale.value = withSequence(
      withTiming(0.8, { duration: 80 }),
      withSpring(1.2, { damping: 5, stiffness: 220 }),
      withSpring(1, { damping: 8, stiffness: 180 }),
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onToggle();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={isLiked ? 'Unlike' : 'Like'}
      accessibilityState={{ disabled: !!disabled, selected: isLiked }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.pill,
        isLiked ? styles.pillOn : styles.pillOff,
        pressed && !disabled && (isLiked ? styles.pillOnPressed : styles.pillOffPressed),
        disabled && (isLiked ? styles.pillOnDisabled : styles.pillOffDisabled),
        style,
      ]}
    >
      <Animated.View style={[styles.icon, iconStyle]}>
        {isLiked ? (
          <HeartIcon filled color={colors.likeIconOn} size={18} />
        ) : (
          <HeartSvg width={18} height={18} />
        )}
      </Animated.View>
      <View style={styles.countWrap}>
        <AnimatedText
          style={[styles.count, isLiked ? styles.countOn : styles.countOff, countStyle]}
        >
          {formatCount(count)}
        </AnimatedText>
      </View>
    </Pressable>
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
  },
  pillOn: { backgroundColor: colors.like },
  pillOnPressed: { backgroundColor: colors.likePressed },
  pillOnDisabled: { backgroundColor: colors.likeDisabled },
  pillOff: { backgroundColor: colors.likeInactiveBg },
  pillOffPressed: { backgroundColor: colors.likeInactiveBgPressed },
  pillOffDisabled: { backgroundColor: 'transparent' },
  icon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countWrap: {
    minWidth: 18,
    alignItems: 'center',
  },
  count: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
  },
  countOn: { color: colors.likeIconOn },
  countOff: { color: colors.commentIcon },
});
