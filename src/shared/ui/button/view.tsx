import React, { forwardRef } from 'react';

import { cva } from 'class-variance-authority';

import { cn } from '~/shared/lib/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}
const variants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-text-inverse hover:bg-primary-hover',
        secondary:
          'bg-bg-secondary text-text-secondary-button hover:bg-bg-secondary-hover',
        ghost:
          'bg-transparent text-ghost-text hover:text-ghost-text-hover hover:bg-ghost-hover-bg',
        danger: 'bg-danger text-text-inverse hover:bg-danger-hover',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
      },
    },
  },
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { className, variant = 'primary', size = 'md', ...rest } = props;

    return (
      <button
        ref={ref}
        type="button"
        className={cn(variants({ variant, size }), className)}
        {...rest}
      />
    );
  },
);
