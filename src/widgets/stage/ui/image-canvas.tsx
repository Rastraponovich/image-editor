import { useUnit } from 'effector-react';

import { $canvas, mountCanvas } from '~/entities/image';

export function ImageCanvas({ viewport }: { viewport: HTMLElement }) {
  const [editor, onMountCanvas] = useUnit([$canvas, mountCanvas]);

  return (
    <div
      ref={container => {
        if (container) {
          onMountCanvas({ container, viewport, editor });
        }
      }}
      className="relative flex items-center justify-center bg-white shadow-[0_0_100px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
    />
  );
}
