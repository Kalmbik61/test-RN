import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { Author } from '@/api/posts';
import { colors, spacing, radii } from '@/theme/tokens';
import { fontFamily, fontSize } from '@/theme/typography';
import { formatDate } from '@/utils/formatDate';

type Props = {
  author: Author;
  createdAt: string;
  isVerified?: boolean;
  variant?: 'default' | 'compact';
};

export function PostHeader({ author, createdAt, isVerified, variant = 'default' }: Props) {
  const compact = variant === 'compact';
  return (
    <View style={styles.row}>
      <Image
        source={author.avatarUrl ? { uri: author.avatarUrl } : undefined}
        style={compact ? styles.avatarLg : styles.avatar}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={300}
        accessibilityLabel={`${author.displayName} avatar`}
      />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={compact ? styles.displayNameLg : styles.displayName} numberOfLines={1}>
            {author.displayName}
          </Text>
          {!compact && isVerified ? <VerifiedBadge /> : null}
        </View>
        {!compact ? <Text style={styles.date}>{formatDate(createdAt)}</Text> : null}
      </View>
    </View>
  );
}

function VerifiedBadge() {
  return (
    <View
      style={styles.badge}
      accessibilityLabel="Verified"
      accessibilityRole="image"
    >
      <Text style={styles.badgeText}>✓</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
  },
  avatarLg: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.secondary,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  displayName: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    color: colors.text,
    flexShrink: 1,
  },
  displayNameLg: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.text,
    flexShrink: 1,
  },
  date: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
  badge: {
    width: 16,
    height: 16,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.bg,
    fontSize: 10,
    fontFamily: fontFamily.bold,
  },
});
