import {
  type ResolvedTheme,
  THEME_STORAGE_KEY,
  type ThemeKey,
  ThemeKeys,
} from './config';

/**
 * Получить сохраненную тему из localStorage
 */
export function getStoredTheme(): ThemeKey | null {
  if (typeof globalThis.window === 'undefined') {
    return null;
  }

  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (
    stored === ThemeKeys.light ||
    stored === ThemeKeys.dark ||
    stored === ThemeKeys.system
  ) {
    return stored;
  }

  return null;
}

/**
 * Сохранить тему в localStorage
 * @todo cделать как эффект
 */
export function saveTheme(theme: ThemeKey): void {
  if (typeof globalThis.window === 'undefined') {
    return;
  }

  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

/**
 * Разрешить тему (преобразовать 'system' в 'light' или 'dark')
 */
export function resolveTheme(
  theme: ThemeKey,
  prefersDarkMode: boolean,
): ResolvedTheme {
  if (theme === ThemeKeys.system) {
    return prefersDarkMode ? ThemeKeys.dark : ThemeKeys.light;
  }

  return theme;
}

/**
 * Применить тему к документу (добавить/удалить класс dark на <html>)
 */
export function applyThemeToHtml(resolvedTheme: ResolvedTheme): void {
  if (typeof globalThis.document === 'undefined') {
    return;
  }

  const root = globalThis.document.documentElement;

  if (resolvedTheme === ThemeKeys.dark) {
    root.classList.add(ThemeKeys.dark);
  } else {
    root.classList.remove(ThemeKeys.dark);
  }
}
