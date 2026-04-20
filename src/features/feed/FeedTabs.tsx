import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '@/theme/tokens';
import { fontFamily } from '@/theme/typography';
import type { PostTier } from '@/api/posts';

type FeedTier = PostTier | undefined;

const TABS: { key: FeedTier; label: string }[] = [
  { key: undefined, label: 'Все' },
  { key: 'free', label: 'Бесплатные' },
  { key: 'paid', label: 'Платные' },
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
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    marginLeft: spacing.lg,
    marginRight: spacing.lg,
    marginBottom: spacing.lg,

  },
  tab: {
    flex: 1,
    padding: 10,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    color: colors.commentIcon,
  },
  labelActive: {
    color: colors.bg,
  },
});
