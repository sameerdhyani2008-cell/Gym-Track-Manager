import colors from '@/constants/colors';
import { useTheme } from '@/context/ThemeContext';

export function useColors() {
  const { isDark, customColors } = useTheme();
  const palette = isDark ? colors.dark : colors.light;
  return { ...palette, ...customColors, radius: colors.radius };
}
