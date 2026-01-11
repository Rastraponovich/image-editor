import { useId } from 'react';

import { useUnit } from 'effector-react';

import { MIN_DIMENSION, PERCENT, ResizeMode } from '../config';
import {
  $image,
  $imageSize,
  $resizeMode,
  $resizePercent,
  $resizedHeight,
  $resizedImageSize,
  $resizedWidth,
  resizeModeChanged,
  resizePercentChanged,
  resizePercentReset,
  resizedHeightChanged,
  resizedWidthChanged,
} from '../model';

export function ResizeModeSelect() {
  const [mode, onChange, image] = useUnit([
    $resizeMode,
    resizeModeChanged,
    $image,
  ]);

  const id = useId();

  return (
    <div className="flex w-full flex-col gap-2 py-2">
      <label htmlFor={id} className="text-sm text-zinc-400">
        Тип пересчета
      </label>
      <select
        id={id}
        value={mode}
        onChange={e => onChange(e.target.value as 'percent' | 'dimensions')}
        disabled={!image}
        className="h-10 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
      >
        <option value={ResizeMode.percent}>В процентах</option>
        <option value={ResizeMode.dimensions}>По ширине и высоте</option>
      </select>
    </div>
  );
}

export function PercentInputField() {
  const [resizePercent, onChange, onReset, image] = useUnit([
    $resizePercent,
    resizePercentChanged,
    resizePercentReset,
    $image,
  ]);

  const id = useId();

  return (
    <div className="flex w-full flex-col gap-2 py-2">
      <label
        htmlFor={id}
        className="flex justify-between text-sm text-zinc-400"
      >
        <span>Процент изменения размера</span>
        <span>{resizePercent}%</span>
      </label>
      <input
        id={id}
        type="number"
        min={PERCENT.MIN}
        max={PERCENT.MAX}
        step={1}
        value={resizePercent}
        onChange={e => {
          const value = Number(e.target.value);
          if (value >= PERCENT.MIN && value <= PERCENT.MAX) {
            onChange(value);
          }
        }}
        onDoubleClick={onReset}
        disabled={!image}
        className="h-10 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
      />
    </div>
  );
}

export function DimensionsInputFields() {
  const [width, height, onWidthChange, onHeightChange, image] = useUnit([
    $resizedWidth,
    $resizedHeight,
    resizedWidthChanged,
    resizedHeightChanged,
    $image,
  ]);

  const widthId = useId();
  const heightId = useId();

  return (
    <div className="flex w-full flex-col gap-3 py-2">
      <div className="flex flex-col gap-2">
        <label htmlFor={widthId} className="text-sm text-zinc-400">
          Ширина
        </label>
        <div className="flex items-center gap-2">
          <input
            id={widthId}
            type="number"
            min={MIN_DIMENSION}
            step={1}
            value={width || ''}
            onChange={e => {
              const value = Number(e.target.value);
              if (value >= MIN_DIMENSION || e.target.value === '') {
                onWidthChange(value || 0);
              }
            }}
            disabled={!image}
            className="h-10 flex-1 rounded-lg border border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
          />
          <span className="text-sm text-zinc-400">px</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={heightId} className="text-sm text-zinc-400">
          Высота
        </label>
        <div className="flex items-center gap-2">
          <input
            id={heightId}
            type="number"
            min={MIN_DIMENSION}
            step={1}
            value={height || ''}
            onChange={e => {
              const value = Number(e.target.value);
              if (value >= MIN_DIMENSION || e.target.value === '') {
                onHeightChange(value || 0);
              }
            }}
            disabled={!image}
            className="h-10 flex-1 rounded-lg border border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
          />
          <span className="text-sm text-zinc-400">px</span>
        </div>
      </div>
    </div>
  );
}

export function ImageInfoSection() {
  return (
    <section className="flex flex-col gap-2 rounded-lg bg-zinc-50 p-3">
      <OriginalImageInfo />
      <NewImageInfo />
    </section>
  );
}

interface ImageInfoProps {
  title: string;
  children: React.ReactNode;
}

function ImageInfo({ children, title }: ImageInfoProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-600">{title}:</span>
      <span className="font-mono text-zinc-900">{children}</span>
    </div>
  );
}

function OriginalImageInfo() {
  const imageSize = useUnit($imageSize);

  return (
    <ImageInfo title="Оригинальный размер">
      {imageSize.width} × {imageSize.height} px
    </ImageInfo>
  );
}

function NewImageInfo() {
  const imageSize = useUnit($resizedImageSize);

  return (
    <ImageInfo title="Новый размер">
      {imageSize.width} × {imageSize.height} px
    </ImageInfo>
  );
}
