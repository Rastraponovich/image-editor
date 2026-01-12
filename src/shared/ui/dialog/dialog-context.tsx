/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useId } from 'react';

interface DialogContextValue {
  open: boolean;
  onClose: () => void;
  titleId: string;
  dialogRef: React.RefObject<HTMLDivElement | null>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialogContext() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within a Dialog component');
  }
  return context;
}

/**
 * Хук для получения состояния открытия диалога
 */
export function useDialogOpen() {
  const { open } = useDialogContext();
  return open;
}

/**
 * Хук для получения функции закрытия диалога
 */
export function useDialogClose() {
  const { onClose } = useDialogContext();
  return onClose;
}

interface DialogProviderProps {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  dialogRef: React.RefObject<HTMLDivElement | null>;
}

export function DialogProvider({
  children,
  open,
  onClose,
  dialogRef,
}: DialogProviderProps) {
  const titleId = useId();

  return (
    <DialogContext.Provider value={{ open, onClose, titleId, dialogRef }}>
      {children}
    </DialogContext.Provider>
  );
}
