import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const DARK_MODE_KEY = 'gym_app_dark_mode';
const CUSTOM_COLORS_KEY = 'gym_app_custom_colors';

export interface CustomColors {
  primary?: string;
  background?: string;
  foreground?: string;
}

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  customColors: CustomColors;
  setCustomColor: (key: keyof CustomColors, value: string | null) => void;
  resetCustomColors: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
  customColors: {},
  setCustomColor: () => {},
  resetCustomColors: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const [customColors, setCustomColors] = useState<CustomColors>({});

  useEffect(() => {
    AsyncStorage.multiGet([DARK_MODE_KEY, CUSTOM_COLORS_KEY]).then((pairs) => {
      const darkVal = pairs[0][1];
      const colorsVal = pairs[1][1];
      if (darkVal !== null) setIsDark(darkVal === 'true');
      if (colorsVal) {
        try { setCustomColors(JSON.parse(colorsVal)); } catch {}
      }
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem(DARK_MODE_KEY, String(next));
  };

  const setCustomColor = async (key: keyof CustomColors, value: string | null) => {
    const next = { ...customColors };
    if (value === null) {
      delete next[key];
    } else {
      next[key] = value;
    }
    setCustomColors(next);
    await AsyncStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(next));
  };

  const resetCustomColors = async () => {
    setCustomColors({});
    await AsyncStorage.removeItem(CUSTOM_COLORS_KEY);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, customColors, setCustomColor, resetCustomColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
