import { useDialogContext } from './dialog-context';

interface DialogHeaderProps {
  title?: string;
}

export function DialogHeader({ title }: DialogHeaderProps) {
  const { titleId } = useDialogContext();

  if (!title) {
    return null;
  }

  return (
    <h2 id={titleId} className="text-lg font-semibold text-zinc-900">
      {title}
    </h2>
  );
}
