import { DimensionValue, View, ViewStyle } from 'react-native';
import { colors, radii } from '@/theme/tokens';

export type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

export function Skeleton({ width, height = 16, borderRadius = radii.sm, style }: SkeletonProps) {
  return (
    <View
      accessibilityLabel="Loading"
      style={[
        {
          backgroundColor: colors.border,
          borderRadius,
          height,
          width: width ?? '100%',
        },
        style,
      ]}
    />
  );
}
