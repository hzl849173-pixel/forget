import { Platform } from 'react-native';

const accentColor = '#A855F7'; // Electric Purple
const streakColor = '#FF8A00'; // Orange
const backgroundColor = '#0A0A0A'; // Near Black
const cardColor = '#141414'; // Card Background
const cardColorAlt = '#1C1C1E'; // Alternate Card / Badge Background
const borderColor = '#252525'; // Border
const textPrimary = '#FFFFFF'; // White
const textSecondary = '#9CA3AF'; // Gray

export const Colors = {
  light: {
    text: textPrimary,
    textSecondary: textSecondary,
    background: backgroundColor,
    card: cardColor,
    cardAlt: cardColorAlt,
    border: borderColor,
    accent: accentColor,
    streak: streakColor,
    tint: accentColor,
    icon: textSecondary,
    tabIconDefault: textSecondary,
    tabIconSelected: accentColor,
  },
  dark: {
    text: textPrimary,
    textSecondary: textSecondary,
    background: backgroundColor,
    card: cardColor,
    cardAlt: cardColorAlt,
    border: borderColor,
    accent: accentColor,
    streak: streakColor,
    tint: accentColor,
    icon: textSecondary,
    tabIconDefault: textSecondary,
    tabIconSelected: accentColor,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
