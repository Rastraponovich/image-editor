import { Monitor, Moon, Sun } from 'lucide-react';

export const THEME_STORAGE_KEY = 'app-theme';

export const ThemeKeys = {
  dark: 'dark',
  light: 'light',
  system: 'system',
} as const;

export type ThemeKey = (typeof ThemeKeys)[keyof typeof ThemeKeys];
export type ResolvedTheme = Omit<ThemeKey, 'system'>;

export const THEMES: ThemeKey[] = [
  ThemeKeys.light,
  ThemeKeys.dark,
  ThemeKeys.system,
];

export const THEME_LABELS: Record<ThemeKey, string> = {
  [ThemeKeys.light]: 'Светлая',
  [ThemeKeys.dark]: 'Темная',
  [ThemeKeys.system]: 'Системная',
};

export const THEME_ICONS: Record<ThemeKey, typeof Sun> = {
  [ThemeKeys.light]: Sun,
  [ThemeKeys.dark]: Moon,
  [ThemeKeys.system]: Monitor,
};
