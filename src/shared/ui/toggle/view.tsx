import { forwardRef } from 'react';

import { cn } from '~/shared/lib/cn';

interface ToggleProps {
  label: string;
  checked: boolean;
  disabled?: boolean;
  className?: string;
  onChange: (
    checked: boolean,
    event?: React.ChangeEvent<HTMLInputElement>,
  ) => void;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (props, ref) => {
    const { label, checked, onChange, className, disabled } = props;

    return (
      <label
        className={cn(
          'flex cursor-pointer items-center justify-between gap-4 py-2 has-[input:disabled]:cursor-default',
          className,
        )}
      >
        <span className="text-text-secondary text-sm">{label}</span>

        <div
          className={cn(
            'focus-within:ring-primary focus-within:ring-offset-bg-app relative h-6 w-11 rounded-full transition-colors duration-200 focus-within:ring-2 focus-within:ring-offset-2',
            checked ? 'bg-primary' : 'bg-border-default',
          )}
        >
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            className="peer sr-only"
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
