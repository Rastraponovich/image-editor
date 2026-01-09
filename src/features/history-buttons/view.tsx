import { useUnit } from 'effector-react';
import { Redo2, Undo2 } from 'lucide-react';

import { Button } from '~/shared/ui';

import { redoButtonClicked, undoButtonClicked } from './model';

export function UndoButton() {
  const handleClick = useUnit(undoButtonClicked);

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={true}
      onClick={handleClick}
      title="Назад (not implemented yet)"
    >
      <Undo2 size={20} />
    </Button>
  );
}

export function RedoButton() {
  const handleClick = useUnit(redoButtonClicked);

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={true}
      onClick={handleClick}
      title="Вперед (not implemented yet)"
    >
      <Redo2 size={20} />
    </Button>
  );
}
