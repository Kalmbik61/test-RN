import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radii, spacing } from '@/theme/tokens';
import { fontFamily, fontSize } from '@/theme/typography';

export type TabKey = 'free' | 'paid';

export type TabsProps = {
  value: TabKey;
  onChange: (next: TabKey) => void;
  style?: ViewStyle;
};

const TABS: { key: TabKey; label: string }[] = [
  { key: 'free', label: 'Free' },
  { key: 'paid', label: 'Paid' },
];

export function Tabs({ value, onChange, style }: TabsProps) {
  return (
    <View style={[styles.row, style]}>
      {TABS.map((t) => {
        const active = value === t.key;
        return (
          <Pressable
            key={t.key}
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
