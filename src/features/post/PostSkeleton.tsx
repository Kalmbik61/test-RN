import { StyleSheet, View } from 'react-native';
import { colors, spacing, radii } from '@/theme/tokens';

export function PostSkeleton() {
  return (
    <View style={styles.container}>
      {/* Cover image placeholder */}
      <View style={styles.cover} />
      <View style={styles.content}>
        {/* Header: avatar + name */}
        <View style={styles.headerRow}>
          <View style={styles.avatar} />
          <View style={styles.headerText}>
            <View style={styles.nameLine} />
            <View style={styles.dateLine} />
          </View>
        </View>
        {/* Body lines */}
        <View style={styles.line1} />
        <View style={styles.line2} />
        <View style={styles.line3} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  cover: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.secondary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  nameLine: {
    height: 14,
    borderRadius: radii.sm,
    backgroundColor: colors.secondary,
    width: '50%',
  },
  dateLine: {
    height: 12,
    borderRadius: radii.sm,
    backgroundColor: colors.secondary,
    width: '30%',
  },
  line1: {
    height: 16,
    borderRadius: radii.sm,
    backgroundColor: colors.secondary,
    width: '100%',
  },
  line2: {
    height: 16,
    borderRadius: radii.sm,
    backgroundColor: colors.secondary,
    width: '90%',
  },
  line3: {
    height: 16,
    borderRadius: radii.sm,
    backgroundColor: colors.secondary,
    width: '75%',
  },
});
