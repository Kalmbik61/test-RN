import { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, spacing } from '@/theme/tokens';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { AlertIcon } from '@/ui/icons/AlertIcon';
import { Button } from '@/ui/Button/Button';

export type ErrorStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  retryLabel?: string;
  onRetry?: () => void;
  style?: ViewStyle;
};

export function ErrorState({
  title,
  description,
  icon,
  retryLabel = 'Retry',
  onRetry,
  style,
}: ErrorStateProps) {
  return (
    <View style={[styles.wrap, style]} accessibilityLabel={`Error: ${title}`}>
      <View style={styles.icon}>{icon ?? <AlertIcon size={48} />}</View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {onRetry ? (
        <Button
          title={retryLabel}
          onPress={onRetry}
          variant="secondary"
          accessibilityLabel={retryLabel}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  icon: {
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.lg,
    color: colors.text,
    textAlign: 'center',
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 280,
  },
  action: {
    marginTop: spacing.md,
    minWidth: 140,
  },
});
