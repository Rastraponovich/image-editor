import { cn } from '~/shared/lib/cn';

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogContent({ children, className }: DialogContentProps) {
  return (
    <div
      className={cn(
        'flex max-h-[90vh] flex-col gap-y-6 overflow-y-auto p-6',
        className,
      )}
    >
      {children}
    </div>
  );
}
