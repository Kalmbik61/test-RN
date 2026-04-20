import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radii, spacing } from '@/theme/tokens';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { formatDate } from '@/utils/formatDate';

export type CommentProps = {
  avatarUrl: string;
  displayName: string;
  text: string;
  createdAt: string;
  style?: ViewStyle;
};

export function Comment({ avatarUrl, displayName, text, createdAt, style }: CommentProps) {
  return (
    <View style={[styles.row, style]}>
      <Image
        source={{ uri: avatarUrl }}
        style={styles.avatar}
        accessibilityIgnoresInvertColors
        accessibilityLabel={`${displayName} avatar`}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.date}>{formatDate(createdAt)}</Text>
        </View>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.secondary,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  name: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    color: colors.text,
    flexShrink: 1,
  },
  date: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
  text: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    color: colors.text,
  },
});
