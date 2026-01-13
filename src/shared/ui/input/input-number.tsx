import { forwardRef } from 'react';

import { cn } from '~/shared/lib/cn';

interface InputNumberProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        {...props}
        ref={ref}
        type="number"
        className={cn(
          'border-border-default bg-surface-elevated text-text-primary focus:border-primary focus:ring-primary/20 disabled:bg-subtle disabled:text-text-tertiary h-10 w-full rounded-lg border px-3 text-sm focus:ring-2 focus:outline-none disabled:cursor-not-allowed',
          className,
        )}
      />
    );
  },
);

InputNumber.displayName = 'UI/InputNumberBase';
