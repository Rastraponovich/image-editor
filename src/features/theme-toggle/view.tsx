import { useUnit } from 'effector-react';

import { cn } from '~/shared/lib/cn';

import { THEMES, THEME_ICONS, THEME_LABELS, type ThemeKey } from './config';
import { $theme, themeChanged } from './model';

export function ThemeToggle() {
  const [theme, changeTheme] = useUnit([$theme, themeChanged]);

  const Icon = THEME_ICONS[theme];

  return (
    <div className="flex items-center gap-2">
      <Icon className="text-text-secondary size-4 shrink-0" />

      <select
        value={theme}
        aria-label="Выбор темы"
        onChange={event => changeTheme(event.target.value as ThemeKey)}
        className={cn(
          'border-border-default text-text-primary h-8 rounded-md border bg-transparent px-2 text-sm transition-colors',
          'hover:border-border-strong focus:border-primary focus:ring-primary/20 focus:ring-2 focus:outline-none',
          'cursor-pointer',
        )}
      >
        {THEMES.map(themeOption => (
          <option key={themeOption} value={themeOption}>
            {THEME_LABELS[themeOption]}
          </option>
        ))}
      </select>
    </div>
  );
}
