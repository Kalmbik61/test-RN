import { ReactNode } from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, spacing } from '@/theme/tokens';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { Button } from '@/ui/Button/Button';

const ILLUSTRATION = require('../../../assets/illustration_sticker.png');

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
  retryLabel = 'Повторить',
  onRetry,
  style,
}: ErrorStateProps) {
  return (
    <View style={[styles.wrap, style]} accessibilityLabel={`Error: ${title}`}>
      {icon ? (
        <View style={styles.icon}>{icon}</View>
      ) : (
        <Image
          source={ILLUSTRATION}
          style={styles.illustration}
          accessibilityIgnoresInvertColors
        />
      )}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {onRetry ? (
        <Button
          title={retryLabel}
          onPress={onRetry}
          accessibilityLabel={retryLabel}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: spacing.lg,
  },
  icon: {
    alignItems: 'center',
  },
  illustration: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  title: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    color: colors.text,
    textAlign: 'center',
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: colors.muted,
    textAlign: 'center',
    alignSelf: 'center',
    maxWidth: 280,
  },
  action: {
    alignSelf: 'stretch',
  },
});
