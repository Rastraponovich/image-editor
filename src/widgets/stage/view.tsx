import { useRef } from 'react';

import { useUnit } from 'effector-react';

import { $image } from '~/entities/image';

import { cn } from '~/shared/lib/cn';

import { ArtBoard, ImageCanvas } from './ui/image-canvas';

export function CanvasStage() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full items-center justify-center overflow-hidden bg-zinc-900 p-12"
    >
      <Wrapper>
        <ArtBoard>
          <ImageCanvas />
        </ArtBoard>
      </Wrapper>
    </div>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  const image = useUnit($image);

  return (
    <>
      <div
        className={cn(
          'flex flex-col items-center gap-4 text-zinc-500',
          image && 'hidden',
        )}
      >
        <p>Загрузите изображение для начала работы</p>
      </div>
      <div className={cn(!image && 'hidden')}>{children}</div>
    </>
  );
}
