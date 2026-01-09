import { useEffect } from 'react';

import { useUnit } from 'effector-react';

import {
  $isDragging,
  interactionFinished,
  interactionMoved,
  interactionStarted,
  wheelScrolled,
} from '~/features/viewport-control';

import { $canvas, mountCanvas, unmountCanvas } from '~/entities/image';

export function ImageCanvas({ viewport }: { viewport: HTMLElement }) {
  const [
    editor,
    isDragging,
    onMount,
    onUnmount,
    onStart,
    onMove,
    onFinish,
    onWheel,
  ] = useUnit([
    $canvas,
    $isDragging,
    mountCanvas,
    unmountCanvas,
    interactionStarted,
    interactionMoved,
    interactionFinished,
    wheelScrolled,
  ]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      onMove({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      onFinish();
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onMove, onFinish]);

  useEffect(() => {
    return () => onUnmount();
  }, [onUnmount]);

  return (
    <div
      ref={node => {
        if (node) {
          onMount({ container: node, viewport, editor });
        }
      }}
      onMouseDown={e => {
        if (e.button !== 0) return;
        e.preventDefault();
        onStart({
          x: e.clientX,
          y: e.clientY,
          startOffset: editor.getOffset(),
        });
      }}
      onWheel={e => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          onWheel({ delta: -e.deltaY });
        }
      }}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      className="relative flex items-center justify-center bg-white shadow-[0_0_100px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
    />
  );
}
