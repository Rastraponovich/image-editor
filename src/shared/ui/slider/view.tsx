import { forwardRef, useId } from 'react';

import { cn } from '../../lib/cn';

interface SliderProps {
  min: number;
  max: number;
  label: string;
  value: number;
  unit?: string;
  step?: number;
  className?: string;
  disabled?: boolean;
  onDoubleClick?: () => void;
  onChange: (value: number) => void;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (props, ref) => {
    const {
      label,
      value,
      onChange,
      onDoubleClick,
      unit = '',
      disabled,
      className,
      ...rest
    } = props;
    const id = useId();

    return (
      <div className="group flex w-full flex-col gap-2 py-2">
        <label
          htmlFor={id}
          className="text-text-secondary group-focus-within:text-text-primary flex justify-between text-sm"
        >
          <span>{label}</span>
          <span>
            {value}
            {unit}
          </span>
        </label>

        <input
          {...rest}
          id={id}
          ref={ref}
          type="range"
          value={value}
          disabled={disabled}
          onDoubleClick={onDoubleClick}
          onChange={event => onChange(Number(event.target.value))}
          className={cn(
            'bg-border-default accent-primary focus-within:bg-primary h-1.5 w-full cursor-pointer appearance-none rounded-lg disabled:cursor-default',
            className,
          )}
        />
      </div>
    );
  },
);
