import { cn } from '~/shared/lib/cn';

import { useDialogClose } from './dialog-context';

interface DialogBackdropProps {
  className?: string;
  onClick?: () => void;
}

export function DialogBackdrop({ onClick, className }: DialogBackdropProps) {
  const close = useDialogClose();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      close();
    }
  };

  return (
    <div
      className={cn('absolute inset-0 bg-white/10 backdrop-blur-sm', className)}
      onClick={handleClick}
    />
  );
}
