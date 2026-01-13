import { X } from 'lucide-react';

import { cn } from '~/shared/lib/cn';

import { useDialogClose } from './dialog-context';

interface DialogCloseButtonProps {
  className?: string;
}

export function DialogCloseButton({ className }: DialogCloseButtonProps) {
  const onClose = useDialogClose();

  return (
    <button
      type="button"
      onClick={onClose}
      className={cn(
        'bg-subtle text-text-secondary hover:bg-bg-secondary hover:text-text-primary focus:ring-primary focus:ring-offset-surface flex size-8 items-center justify-center rounded-md transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none',
        className,
      )}
      aria-label="Закрыть диалог"
    >
      <X size={18} aria-hidden="true" />
    </button>
  );
}
