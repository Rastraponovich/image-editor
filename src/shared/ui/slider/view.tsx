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
          className="flex justify-between text-sm text-zinc-400 group-focus-within:text-zinc-900"
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
            'h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-blue-500 focus-within:bg-green-400 disabled:cursor-default',
            className,
          )}
        />
      </div>
    );
  },
);
