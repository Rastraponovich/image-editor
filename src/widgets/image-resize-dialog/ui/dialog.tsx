import { useUnit } from 'effector-react';

import {
  Dialog as DialogBase,
  DialogCloseButton,
  DialogHeader,
} from '~/shared/ui';

import { dialogInstance } from '../model';

interface DialogBaseProps {
  children?: React.ReactNode;
  title?: string;
}

export function Dialog({ children, title }: DialogBaseProps) {
  const [open, close] = useUnit([
    dialogInstance.$isOpened,
    dialogInstance.close,
  ]);

  return (
    <DialogBase open={open} onClose={close}>
      <header className="flex items-center justify-between gap-x-3">
        <DialogHeader title={title} />
        <DialogCloseButton />
      </header>
      {children}
    </DialogBase>
  );
}
