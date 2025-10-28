/**
 * App Theme Configuration
 * Based on Snappin Logo Colors
 */

export const COLORS = {
  // Primary Colors (From Logo)
  primary: '#5B9FED', // Main blue
  primaryDark: '#3A7FCD', // Darker blue
  primaryLight: '#7DB5F5', // Lighter blue

  // Accent Colors
  accent: '#4A8FDC',
  accentLight: '#6BA8E8',

  // Neutral Colors
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceLight: '#F1F5F9',

  // Text Colors
  text: '#0F172A',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  textDisabled: '#CBD5E1',

  // Border Colors
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Status Colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Special Colors
  online: '#10B981',
  offline: '#94A3B8',
  white: '#FFFFFF',
  black: '#000000',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Gradient
  gradientStart: '#5B9FED',
  gradientEnd: '#3A7FCD',
};

export const SIZES = {
  // Font Sizes
  fontXs: 11,
  fontSm: 13,
  fontBase: 15,
  fontMd: 16,
  fontLg: 18,
  fontXl: 20,
  font2Xl: 24,
  font3Xl: 28,
  font4Xl: 32,

  // Spacing
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,

  // Border Radius
  radiusXs: 4,
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 20,
  radiusFull: 9999,

  // Icon Sizes
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,

  // Avatar Sizes
  avatarSm: 40,
  avatarMd: 56,
  avatarLg: 70,
  avatarXl: 100,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const THEME = {
  colors: COLORS,
  sizes: SIZES,
  shadows: SHADOWS,
};

export default THEME;
