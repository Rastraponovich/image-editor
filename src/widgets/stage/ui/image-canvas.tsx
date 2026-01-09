import { useRef } from 'react';

import { useUnit } from 'effector-react';

import { $canvas, mountCanvas } from '~/entities/image';

export function ArtBoard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex items-center justify-center bg-white shadow-[0_0_100px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
      {children}
    </div>
  );
}

export function ImageCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [editor, onMountCanvas] = useUnit([$canvas, mountCanvas]);

  return (
    <div
      ref={ref => {
        if (ref && !containerRef.current) {
          onMountCanvas({
            container: ref,
            editor,
          });
          containerRef.current = ref;
        }
      }}
      className="flex h-full w-full items-center justify-center"
    />
  );
}
