import { StyleSheet } from 'react-native';

export const COLORS = {
  // Theme Colors
  bgLight: '#F5F3EE',
  bgDark: '#0f1419',
  surfaceLight: '#FFFFFF',
  surfaceDark: '#1a1f2e',
  textLight: '#1a1a1a',
  textDark: '#f5f3ee',
  textMutedLight: '#6b7280',
  textMutedDark: '#9ca3af',
  borderLight: '#e5e7eb',
  borderDark: '#2a3142',

  // Role Theme Colors
  farmer: '#2D4F39',
  farmerDark: '#1B3022',
  officer: '#2B5C8F',
  admin: '#6D28D9',

  // Alerts / Action Colors
  danger: '#E17055',
  success: '#00B894',
  warning: '#FDCB6E',
  info: '#3B82F6',

  // Misc Colors
  white: '#FFFFFF',
  cream: '#F9FBF9',
  gray100: '#F2F5F3',
  gold: '#F59E0B'
};

export const getThemeColors = (theme: 'light' | 'dark') => {
  const isDark = theme === 'dark';
  return {
    bg: isDark ? COLORS.bgDark : COLORS.bgLight,
    surface: isDark ? COLORS.surfaceDark : COLORS.surfaceLight,
    text: isDark ? COLORS.textDark : COLORS.textLight,
    textMuted: isDark ? COLORS.textMutedDark : COLORS.textMutedLight,
    border: isDark ? COLORS.borderDark : COLORS.borderLight,
    isDark
  };
};

export const commonStyles = StyleSheet.create({
  shadow: {
    shadowColor: '#1b3022',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  shadowMd: {
    shadowColor: '#1b3022',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  }
});
