import { useEffect, useRef } from 'react';

import { useDialogContext } from './dialog-context';

/**
 * Обработка ESC клавиши для закрытия диалога
 * Использует onClose из контекста
 */
export function useEscapeKey() {
  const { open, onClose } = useDialogContext();

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);
}

/**
 * Блокировка скролла body при открытии модального окна
 * и возврат фокуса к предыдущему элементу при закрытии
 * Использует open из контекста
 */
export function useBodyScrollLock() {
  const { open } = useDialogContext();
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previousActiveElementRef.current =
        (document.activeElement as HTMLElement) || null;

      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      return () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        previousActiveElementRef.current?.focus();
      };
    }
  }, [open]);
}

/**
 * Установка начального фокуса на первый интерактивный элемент
 * Использует dialogRef и open из контекста
 */
export function useInitialFocus() {
  const { dialogRef, open } = useDialogContext();

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    requestAnimationFrame(() => {
      const firstFocusable = dialog.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      if (firstFocusable) {
        firstFocusable.focus();
      }
    });
  }, [open, dialogRef]);
}

/**
 * Ловушка фокуса - удерживает фокус внутри диалога
 * Использует dialogRef и open из контекста
 */
export function useFocusTrap() {
  const { dialogRef, open } = useDialogContext();

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    dialog.addEventListener('keydown', handleKeyDown);
    return () => {
      dialog.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, dialogRef]);
}
