import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '@/theme/tokens';
import { fontFamily, fontSize } from '@/theme/typography';
import type { PostTier } from '@/api/posts';

type FeedTier = PostTier | undefined;

const TABS: { key: FeedTier; label: string }[] = [
  { key: undefined, label: 'Все' },
  { key: 'free', label: 'Free' },
  { key: 'paid', label: 'Paid' },
];

type FeedTabsProps = {
  value: FeedTier;
  onChange: (tier: FeedTier) => void;
};

export function FeedTabs({ value, onChange }: FeedTabsProps) {
  return (
    <View style={styles.row}>
      {TABS.map((t) => {
        const active = value === t.key;
        return (
          <Pressable
            key={t.key ?? 'all'}
            onPress={() => onChange(t.key)}
            accessibilityRole="button"
            accessibilityLabel={`Tab ${t.label}`}
            accessibilityState={{ selected: active }}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    padding: spacing.xs,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  tabActive: {
    backgroundColor: colors.bg,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  labelActive: {
    color: colors.text,
  },
});
