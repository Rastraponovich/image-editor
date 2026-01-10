import { useEffect } from 'react';

import { useUnit } from 'effector-react';

import { $canvas, mountCanvas, unmountCanvas } from '~/entities/image';

import { ViewportControlWrapper } from './viewport-control-wrapper';

export function ImageCanvas({ viewport }: { viewport: HTMLElement }) {
  const [editor, onMount, onUnmount] = useUnit([
    $canvas,
    mountCanvas,
    unmountCanvas,
  ]);

  useEffect(() => {
    return () => onUnmount();
  }, [onUnmount]);

  return (
    <ViewportControlWrapper
      editor={editor}
      className="relative flex items-center justify-center bg-white shadow-[0_0_100px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
    >
      <div
        ref={node => {
          if (node) {
            onMount({ container: node, viewport });
          }
        }}
      />
    </ViewportControlWrapper>
  );
}
