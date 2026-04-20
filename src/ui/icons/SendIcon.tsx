import Svg, { Path, SvgProps } from 'react-native-svg';

type Props = SvgProps & { size?: number; color?: string };

export function SendIcon({ size = 24, color = '#5B2FE0', ...rest }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      <Path
        d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a1 1 0 00-1.38 1.2L4.5 12 2.02 19.2a1 1 0 001.38 1.2zM6 13l-1.5 4.5L17 12 4.5 6.5 6 11h8v2H6z"
        fill={color}
      />
    </Svg>
  );
}
