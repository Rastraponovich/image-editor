import { forwardRef, useId } from 'react';

import { cn } from '~/shared/lib/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  className?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (props, ref) => {
    const id = useId();
    const { label, children, className, ...rest } = props;

    return (
      <div className="group flex w-full flex-col gap-2 py-2">
        <label
          htmlFor={id}
          className="text-text-secondary group-focus-within:text-text-primary text-sm"
        >
          {label}
        </label>

        <select
          id={id}
          ref={ref}
          className={cn(
            'border-border-default bg-surface-elevated text-text-primary h-10 w-full rounded-lg border px-3 text-sm transition-colors',
            'hover:border-border-strong focus:border-primary focus:ring-primary/20 focus:ring-2 focus:outline-none',
            'disabled:bg-subtle disabled:text-text-tertiary disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...rest}
        >
          {children}
        </select>
      </div>
    );
  },
);

Select.displayName = 'UI/Select';
