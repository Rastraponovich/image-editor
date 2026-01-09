import { forwardRef } from 'react';

import { cn } from '~/shared/lib/cn';

interface ToggleProps {
  label: string;
  checked: boolean;
  className?: string;
  onChange: (
    checked: boolean,
    event?: React.ChangeEvent<HTMLInputElement>,
  ) => void;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (props, ref) => {
    const { label, checked, onChange, className } = props;

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
            ref={ref}
            type="checkbox"
            checked={checked}
            className="sr-only"
            onChange={event => onChange(event.target.checked, event)}
          />

          <div
            className={cn(
              'absolute top-1 left-1 size-4 transform rounded-full bg-white transition-transform duration-200',
              checked ? 'translate-x-5' : 'translate-x-0',
            )}
          />
        </div>
      </label>
    );
  },
);
