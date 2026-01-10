import { useUnit } from 'effector-react';

import { Slider } from '~/shared/ui';

import {
  $imageSize,
  $resizePercent,
  $resizedImageSize,
  resizePercentChanged,
  resizePercentReset,
} from '../model';

export function PercentSliderField() {
  const [resizePercent, onChange, onDoubleClick] = useUnit([
    $resizePercent,
    resizePercentChanged,
    resizePercentReset,
  ]);

  return (
    <Slider
      min={1}
      unit="%"
      step={1}
      max={200}
      onChange={onChange}
      value={resizePercent}
      onDoubleClick={onDoubleClick}
      label="Процент изменения размера"
    />
  );
}

export function ImageInfoSection() {
  return (
    <section className="flex flex-col gap-2 rounded-lg bg-zinc-900 p-3">
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
      <span className="text-zinc-400">{title}:</span>
      <span className="font-mono text-zinc-100">{children}</span>
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
