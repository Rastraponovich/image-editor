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
          'h-10 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400',
          className,
        )}
      />
    );
  },
);

InputNumber.displayName = 'UI/InputNumberBase';
