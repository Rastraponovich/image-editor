import { useUnit } from 'effector-react';
import { Download, RotateCcw } from 'lucide-react';

import { Button } from '~/shared/ui';

import {
  $disabledDownload,
  $downloadPending,
  dialogInstance,
  downloadResizedImageClicked,
  resetButtonClicked,
} from '../model';

export function OpenButton() {
  const onClick = useUnit(dialogInstance.open);
  return <Button onClick={onClick}>Изменить размер</Button>;
}

export function ResetButton() {
  const [disabled, handleClick] = useUnit([
    $disabledDownload,
    resetButtonClicked,
  ]);

  return (
    <Button
      size="md"
      variant="danger"
      className="w-fit"
      disabled={disabled}
      onClick={handleClick}
    >
      <RotateCcw size={16} className="mr-2" />
      Сбросить
    </Button>
  );
}

export function DownloadButton() {
  const [disabledDownload, pending, onClick] = useUnit([
    $disabledDownload,
    $downloadPending,
    downloadResizedImageClicked,
  ]);

  return (
    <Button
      size="md"
      onClick={onClick}
      variant="primary"
      className="w-fit"
      disabled={disabledDownload}
    >
      {pending ? (
        'Обработка и скачивание...'
      ) : (
        <>
          <Download size={18} className="mr-2" />
          применить и скачать
        </>
      )}
    </Button>
  );
}
