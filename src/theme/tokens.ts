export const colors = {
  bg: '#FFFFFF',
  screenBg: '#F5F8FD',
  text: '#0A0A0A',
  muted: '#8E8E93',
  primary: '#5B2FE0',
  primaryPressed: '#4824B5',
  primaryDisabled: '#D6CDF7',
  moneyBg: '#6115CD',
  like: '#E63E5C',
  likePressed: '#C72F4B',
  likeDisabled: '#F8C5D2',
  likeIconOn: '#FFE5EB',
  likeInactiveBg: '#EDEFF3',
  likeInactiveBgPressed: '#DDE1E8',
  commentBg: '#E5E7EB',
  commentIcon: '#5B6770',
  link: '#5B2FE0',
  secondary: '#F2F2F7',
  border: '#E5E5EA',
  danger: '#FF3B30',
  success: '#34C759',
  overlay: 'rgba(0,0,0,0.4)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Radii = typeof radii;
