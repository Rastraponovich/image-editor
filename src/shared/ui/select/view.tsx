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
          className="text-sm text-zinc-400 group-focus-within:text-zinc-900"
        >
          {label}
        </label>

        <select
          id={id}
          ref={ref}
          className={cn(
            'h-10 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400',
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
