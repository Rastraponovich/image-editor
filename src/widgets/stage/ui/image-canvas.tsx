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
      className="bg-surface ring-border-subtle relative flex items-center justify-center shadow-lg ring-1"
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
