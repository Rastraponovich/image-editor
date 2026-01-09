import { useRef } from 'react';

import { useUnit } from 'effector-react';

import { $canvas, mountCanvas } from '~/entities/image';

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
