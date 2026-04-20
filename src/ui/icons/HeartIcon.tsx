import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme/tokens';

type Props = {
  size?: number;
  filled?: boolean;
  color?: string;
};

export function HeartIcon({ size = 20, filled = false, color = colors.primary }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 21s-7.5-4.5-9.5-9.5C1 8 3 4 7 4c2 0 3.5 1 5 2.5C13.5 5 15 4 17 4c4 0 6 4 4.5 7.5C19.5 16.5 12 21 12 21Z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
