import { Image, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { HeartIcon } from '@/ui/icons/HeartIcon';
import { colors, radii, spacing } from '@/theme/tokens';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

export type CommentProps = {
  avatarUrl: string;
  displayName: string;
  text: string;
  likesCount?: number;
  isLiked?: boolean;
  onToggleLike?: () => void;
  style?: ViewStyle;
};

export function Comment({
  avatarUrl,
  displayName,
  text,
  likesCount,
  isLiked = false,
  onToggleLike,
  style,
}: CommentProps) {
  const showLikes = typeof likesCount === 'number';
  return (
    <View style={[styles.row, style]}>
      <Image
        source={{ uri: avatarUrl }}
        style={styles.avatar}
        accessibilityIgnoresInvertColors
        accessibilityLabel={`${displayName} avatar`}
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={styles.text}>{text}</Text>
      </View>
      {showLikes ? (
        <Pressable
          onPress={onToggleLike}
          disabled={!onToggleLike}
          accessibilityRole="button"
          accessibilityLabel={isLiked ? 'Убрать лайк' : 'Поставить лайк'}
          hitSlop={8}
          style={styles.likeWrap}
        >
          <HeartIcon
            size={20}
            filled={isLiked}
            color={isLiked ? colors.like : colors.commentIcon}
          />
          <Text style={styles.likeCount}>{likesCount}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.secondary,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  text: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: colors.muted,
  },
  likeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  likeCount: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.muted,
  },
});
