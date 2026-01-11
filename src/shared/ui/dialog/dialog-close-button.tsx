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
        'flex size-8 items-center justify-center rounded-md bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white focus:outline-none',
        className,
      )}
      aria-label="Закрыть диалог"
    >
      <X size={18} aria-hidden="true" />
    </button>
  );
}
