import { forwardRef, useId } from 'react';

interface SliderProps {
  min: number;
  max: number;
  label: string;
  value: number;
  unit?: string;
  step?: number;
  onChange: (value: number) => void;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (props, ref) => {
    const { label, value, onChange, unit = '', ...rest } = props;
    const id = useId();

    return (
      <div className="flex w-full flex-col gap-2 py-2">
        <label
          htmlFor={id}
          className="flex justify-between text-sm text-zinc-400"
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
          onChange={event => onChange(Number(event.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-blue-500 focus-within:bg-green-400 disabled:cursor-default"
        />
      </div>
    );
  },
);
