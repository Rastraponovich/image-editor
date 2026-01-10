import { type ReactNode, useEffect, useRef } from 'react';

import { useUnit } from 'effector-react';

import {
  $isDragging,
  interactionFinished,
  interactionMoved,
  interactionStarted,
  wheelScrolled,
} from '~/features/viewport-control';

import type { CanvasEditor } from '~/entities/image';

interface ViewportControlWrapperProps {
  children: ReactNode;
  editor: CanvasEditor | null;
  className?: string;
  style?: React.CSSProperties;
}

export function ViewportControlWrapper(props: ViewportControlWrapperProps) {
  const { children, editor, className, style } = props;

  const [isDragging, onStart, onMove, onFinish, onWheel] = useUnit([
    $isDragging,
    interactionStarted,
    interactionMoved,
    interactionFinished,
    wheelScrolled,
  ]);

  // Храним актуальные функции в ref для избежания пересоздания эффекта
  const handlersRef = useRef({ onMove, onFinish });
  // Отслеживаем активный pointerId для изоляции взаимодействий
  const activePointerIdRef = useRef<number | null>(null);

  useEffect(() => {
    handlersRef.current = { onMove, onFinish };
  }, [onMove, onFinish]);

  useEffect(() => {
    if (!isDragging) {
      activePointerIdRef.current = null;
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      // Обрабатываем только события от активного указателя
      if (
        activePointerIdRef.current !== null &&
        event.pointerId !== activePointerIdRef.current
      ) {
        return;
      }
      handlersRef.current.onMove({ x: event.clientX, y: event.clientY });
    };

    const handlePointerUp = (event: PointerEvent) => {
      // Завершаем только если это наш указатель
      if (
        activePointerIdRef.current !== null &&
        event.pointerId !== activePointerIdRef.current
      ) {
        return;
      }
      activePointerIdRef.current = null;
      handlersRef.current.onFinish();
    };

    globalThis.addEventListener('pointermove', handlePointerMove);
    globalThis.addEventListener('pointerup', handlePointerUp);

    return () => {
      globalThis.removeEventListener('pointermove', handlePointerMove);
      globalThis.removeEventListener('pointerup', handlePointerUp);
      activePointerIdRef.current = null;
    };
  }, [isDragging]);

  return (
    <div
      onPointerDown={event => {
        if (event.button !== 0 || !editor) {
          return;
        }
        // Сохраняем pointerId для изоляции взаимодействий
        activePointerIdRef.current = event.pointerId;
        event.preventDefault();
        onStart({
          x: event.clientX,
          y: event.clientY,
          startOffset: editor.getOffset(),
        });
      }}
      onWheel={event => {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          onWheel({ delta: -event.deltaY });
        }
      }}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  );
}
