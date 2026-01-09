import React from 'react';

import { cn } from '~/shared/lib/cn';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function Toggle({ label, checked, onChange, className }: ToggleProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center justify-between gap-4 py-2',
        className,
      )}
    >
      <span className="text-sm text-zinc-400">{label}</span>
      <div
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-zinc-900',
          checked ? 'bg-blue-600' : 'bg-zinc-700',
        )}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
        />
        <div
          className={cn(
            'absolute top-1 left-1 h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </div>
    </label>
  );
}
