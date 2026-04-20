export const colors = {
  bg: '#FFFFFF',
  text: '#0A0A0A',
  muted: '#8E8E93',
  primary: '#FF4D6D',
  primaryPressed: '#E63E5C',
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
