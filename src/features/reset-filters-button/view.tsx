import { useUnit } from 'effector-react';
import { RotateCcw } from 'lucide-react';

import { $hasChanges, resetFilters } from '~/entities/image';

import { Button } from '~/shared/ui';

export function ResetButton() {
  const [handleReset, hasChanges] = useUnit([resetFilters, $hasChanges]);

  return (
    <Button
      size="sm"
      variant="ghost"
      title="Сбросить все"
      onClick={handleReset}
      disabled={!hasChanges}
      className="disabled:bg-gray-50/10"
    >
      <RotateCcw size={18} />
    </Button>
  );
}
