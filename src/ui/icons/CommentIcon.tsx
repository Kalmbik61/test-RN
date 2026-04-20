import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme/tokens';

type Props = {
  size?: number;
  color?: string;
};

export function CommentIcon({ size = 18, color = colors.commentIcon }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M5 3h14a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-7l-5 4v-4H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z"
        fill={color}
      />
    </Svg>
  );
}
