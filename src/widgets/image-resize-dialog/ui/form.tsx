import { useId } from 'react';

import { useUnit } from 'effector-react';

import { InputNumber, Select, Slider } from '~/shared/ui';

import {
  MIME_TYPES,
  MIN_DIMENSION,
  PERCENT,
  QUALITY,
  ResizeMode,
} from '../config';
import {
  $downloadPending,
  $image,
  $imageSize,
  $outputFormat,
  $quality,
  $resizeMode,
  $resizePercent,
  $resizedHeight,
  $resizedImageSize,
  $resizedWidth,
  outputFormatChanged,
  qualityChanged,
  qualityReset,
  resizeModeChanged,
  resizePercentChanged,
  resizePercentReset,
  resizedHeightChanged,
  resizedWidthChanged,
} from '../model';
import { DownloadButton, ResetButton } from './button';

export function ResizeModeSelect() {
  const [value, handleChange] = useUnit([$resizeMode, resizeModeChanged]);

  return (
    <Select
      value={value}
      label="Тип пересчета"
      onChange={event => handleChange(event.target.value as ResizeMode)}
    >
      <option value={ResizeMode.percent}>В процентах</option>
      <option value={ResizeMode.dimensions}>По ширине и высоте</option>
    </Select>
  );
}

export function PercentInputField() {
  const id = useId();

  const [value, handleChange, handleReset] = useUnit([
    $resizePercent,
    resizePercentChanged,
    resizePercentReset,
  ]);

  return (
    <div className="group flex w-full flex-col gap-2 py-2">
      <label
        htmlFor={id}
        className="flex justify-between text-sm text-zinc-400 group-focus-within:text-zinc-900"
      >
        <span>Процент изменения размера</span>
        <span>{value}%</span>
      </label>

      <InputNumber
        id={id}
        step={1}
        value={value}
        min={PERCENT.MIN}
        max={PERCENT.MAX}
        onDoubleClick={handleReset}
        onChange={event => {
          const value = Number(event.target.value);
          if (value >= PERCENT.MIN && value <= PERCENT.MAX) {
            handleChange(value);
          }
        }}
      />
    </div>
  );
}

function WidthInputField() {
  const [width, handleChange] = useUnit([$resizedWidth, resizedWidthChanged]);

  const id = useId();

  return (
    <div className="group flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-sm text-zinc-400 group-focus-within:text-zinc-900"
      >
        Ширина
      </label>

      <div className="flex items-center gap-2">
        <InputNumber
          id={id}
          step={1}
          className="flex-1"
          min={MIN_DIMENSION}
          value={width || ''}
          onChange={event => {
            const value = Number(event.target.value);
            if (value >= MIN_DIMENSION || event.target.value === '') {
              handleChange(value || 0);
            }
          }}
        />
        <span className="text-sm text-zinc-400">px</span>
      </div>
    </div>
  );
}

function HeightInputField() {
  const id = useId();
  const [value, handleChange] = useUnit([$resizedHeight, resizedHeightChanged]);

  return (
    <div className="group flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-sm text-zinc-400 group-focus-within:text-zinc-900"
      >
        Высота
      </label>

      <div className="flex items-center gap-2">
        <InputNumber
          id={id}
          step={1}
          className="flex-1"
          min={MIN_DIMENSION}
          value={value || ''}
          onChange={event => {
            const value = Number(event.target.value);
            if (value >= MIN_DIMENSION || event.target.value === '') {
              handleChange(value || 0);
            }
          }}
        />
        <span className="text-sm text-zinc-400">px</span>
      </div>
    </div>
  );
}

export function DimensionsInputFields() {
  return (
    <div className="flex w-full flex-col gap-3 py-2">
      <WidthInputField />

      <HeightInputField />
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

export function FormatSelect() {
  const [value, handleChange] = useUnit([$outputFormat, outputFormatChanged]);

  return (
    <Select
      value={value}
      label="Формат вывода"
      onChange={event => handleChange(event.target.value)}
    >
      <option value={MIME_TYPES.JPEG}>JPEG</option>
      <option value={MIME_TYPES.PNG}>PNG</option>
      <option value={MIME_TYPES.WEBP}>WebP</option>
    </Select>
  );
}

export function QualitySlider() {
  const [quality, setQuality, resetQuality, outputFormat] = useUnit([
    $quality,
    qualityChanged,
    qualityReset,
    $outputFormat,
  ]);

  // Конвертируем в проценты для отображения
  const qualityPercent = Math.round(quality * PERCENT.DIVISOR);
  const minPercent = Math.round(QUALITY.MIN * PERCENT.DIVISOR);
  const maxPercent = Math.round(QUALITY.MAX * PERCENT.DIVISOR);
  const stepPercent = Math.round(QUALITY.STEP * PERCENT.DIVISOR);

  return (
    <Slider
      unit="%"
      min={minPercent}
      max={maxPercent}
      step={stepPercent}
      value={qualityPercent}
      label="Качество сжатия"
      onDoubleClick={resetQuality}
      disabled={outputFormat === MIME_TYPES.PNG}
      onChange={value => setQuality(value / PERCENT.DIVISOR)}
      className="disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}

interface FieldsetProps {
  className?: string;
  children: React.ReactNode;
}
export function Fieldset(props: FieldsetProps) {
  const { children, className } = props;
  const [pending, image] = useUnit([$downloadPending, $image]);

  return (
    <fieldset className={className} disabled={pending || !image}>
      {children}
    </fieldset>
  );
}

export function FormActions() {
  return (
    <fieldset className="flex items-center justify-between gap-x-3">
      <ResetButton />

      <DownloadButton />
    </fieldset>
  );
}
