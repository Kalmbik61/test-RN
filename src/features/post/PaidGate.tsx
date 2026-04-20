import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, radii } from '@/theme/tokens';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

export function PaidGate() {
  return (
    <View style={styles.gate}>
      <View style={styles.skeleton1} />
      <View style={styles.skeleton2} />
      <View style={styles.skeleton3} />
      <Text style={styles.title}>Доступно по подписке</Text>
      <Text style={styles.sub}>Поддержите автора, чтобы прочитать полный пост</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  gate: {
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  skeleton1: {
    height: 16,
    borderRadius: radii.sm,
    backgroundColor: colors.secondary,
    width: '100%',
  },
  skeleton2: {
    height: 16,
    borderRadius: radii.sm,
    backgroundColor: colors.secondary,
    width: '85%',
  },
  skeleton3: {
    height: 16,
    borderRadius: radii.sm,
    backgroundColor: colors.secondary,
    width: '70%',
  },
  title: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    color: colors.text,
    marginTop: spacing.md,
  },
  sub: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: colors.muted,
  },
});
