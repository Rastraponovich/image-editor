import { useRef } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '~/shared/lib/cn';

import { DialogBackdrop } from './dialog-backdrop';
import { DialogContent } from './dialog-content';
import { DialogProvider, useDialogContext } from './dialog-context';
import {
  useBodyScrollLock,
  useEscapeKey,
  useFocusTrap,
  useInitialFocus,
} from './hooks';

export interface DialogProps {
  open: boolean;
  className?: string;
  onClose: () => void;
  children?: React.ReactNode;
  onBackdropClick?: () => void;
}

/**
 * Компонент для применения эффектов диалога (хуки)
 * Должен быть внутри DialogProvider для доступа к контексту
 */
function DialogEffects() {
  useEscapeKey();
  useBodyScrollLock();
  useInitialFocus();
  useFocusTrap();
  return null;
}

interface DialogInnerProps {
  className?: string;
  children: React.ReactNode;
  onBackdropClick?: () => void;
}

function DialogInner(props: DialogInnerProps) {
  const { children, className, onBackdropClick } = props;
  const { titleId, dialogRef } = useDialogContext();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <DialogBackdrop onClick={onBackdropClick} />

      {/* Dialog content */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={event => event.stopPropagation()}
        className={cn(
          'animate-fade-in-scale border-border-subtle bg-surface relative z-10 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border p-0 shadow-2xl duration-200 outline-none',
          className,
        )}
      >
        <DialogContent>{children}</DialogContent>
      </div>
    </div>
  );
}

export function Dialog({
  open,
  onClose,
  children,
  onBackdropClick,
  className,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleBackdropClick = () => {
    if (onBackdropClick) {
      onBackdropClick();
    } else {
      onClose();
    }
  };

  if (!open) {
    return null;
  }

  // Проверяем, что document.body существует (для SSR)
  if (typeof document === 'undefined' || !document.body) {
    return null;
  }

  const dialogContent = (
    <DialogProvider open={open} onClose={onClose} dialogRef={dialogRef}>
      <DialogEffects />
      <DialogInner className={className} onBackdropClick={handleBackdropClick}>
        {children}
      </DialogInner>
    </DialogProvider>
  );

  // Всегда используем Portal для рендеринга в document.body
  // Это гарантирует, что диалог рендерится вне основного DOM дерева
  return createPortal(dialogContent, document.body);
}
