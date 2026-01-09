import { useRef } from 'react';

import { useUnit } from 'effector-react';

import { $image } from '~/entities/image/model';

import { ImageCanvas } from './ui/image-canvas';
import { StagePlaceholder } from './ui/placeholder';

export function CanvasStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const image = useUnit($image);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full items-center justify-center overflow-hidden bg-zinc-900"
    >
      {!image ? <StagePlaceholder /> : <ImageCanvas />}
    </div>
  );
}
