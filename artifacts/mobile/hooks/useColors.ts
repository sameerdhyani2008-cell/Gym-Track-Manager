import colors from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';

function addAlpha(hex: string, alpha: string): string {
  if (hex.startsWith('#') && hex.length === 7) return hex + alpha;
  return hex;
}

export function useColors() {
  const { isDark, customColors } = useTheme();
  const palette = isDark ? colors.dark : colors.light;
  const merged = { ...palette, ...customColors, radius: colors.radius };

  const hasGradient = !!(customColors.gradientFrom && customColors.gradientTo);
  if (hasGradient) {
    merged.card = addAlpha(palette.card, 'bb');
    merged.secondary = addAlpha(palette.secondary, '88');
    merged.muted = addAlpha(palette.muted, '88');
    merged.border = addAlpha(palette.border, '77');
    merged.input = addAlpha(palette.input, '88');
    if (!customColors.background) {
      merged.background = 'transparent';
    }
  }

  return merged;
}
