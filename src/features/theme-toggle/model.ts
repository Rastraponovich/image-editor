import { trackMediaQuery } from '@withease/web-api';
import { createEffect, createEvent, createStore, sample } from 'effector';

import { applicationStarted } from '~/shared/init';

import type { ResolvedTheme, ThemeKey } from './config';
import { ThemeKeys } from './config';
import {
  applyThemeToHtml,
  getStoredTheme,
  resolveTheme,
  saveTheme,
} from './lib';

// Интеграция с @withease/web-api для отслеживания системной темы
const { $matches: $prefersDarkMode } = trackMediaQuery(
  '(prefers-color-scheme: dark)',
  {
    setup: applicationStarted,
  },
);

export const themeChanged = createEvent<ThemeKey>();

const applyThemeFx = createEffect<ResolvedTheme, void>(resolvedTheme => {
  applyThemeToHtml(resolvedTheme);
});

export const $theme = createStore<ThemeKey>(ThemeKeys.system);
export const $resolvedTheme = createStore<ResolvedTheme>(ThemeKeys.light);

// Инициализация темы при старте приложения
sample({
  clock: applicationStarted,
  fn: () => {
    const stored = getStoredTheme();
    return stored ?? ThemeKeys.system;
  },
  target: $theme,
});

// Сохранение темы в localStorage при изменении
sample({
  clock: themeChanged,
  fn: theme => {
    saveTheme(theme);
    return theme;
  },
  target: $theme,
});

// Разрешение темы на основе $theme и системных настроек
sample({
  clock: [$theme, $prefersDarkMode],
  source: { theme: $theme, prefersDarkMode: $prefersDarkMode },
  fn: ({ theme, prefersDarkMode }) => {
    const resolved = resolveTheme(theme, prefersDarkMode);
    // Синхронное применение при инициализации для предотвращения мигания
    if (typeof globalThis.window !== 'undefined') {
      applyThemeToHtml(resolved);
    }
    return resolved;
  },
  target: $resolvedTheme,
});

// Применение темы к HTML при изменении resolvedTheme
sample({
  clock: $resolvedTheme,
  target: applyThemeFx,
});
