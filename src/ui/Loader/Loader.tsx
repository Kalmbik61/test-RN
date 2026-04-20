import { ActivityIndicator, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, spacing } from '@/theme/tokens';

export type LoaderProps = {
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
};

export function Loader({ size = 'large', color = colors.primary, style }: LoaderProps) {
  return (
    <View style={[styles.wrap, style]} accessibilityRole="progressbar" accessibilityLabel="Loading">
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
});
