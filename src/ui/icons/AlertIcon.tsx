import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '@/theme/tokens';

type Props = { size?: number; color?: string };

export function AlertIcon({ size = 32, color = colors.danger }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} fill="none" />
      <Path d="M12 7v6" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M12 17h.01" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
