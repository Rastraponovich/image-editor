import { useUnit } from 'effector-react';
import { Download, RotateCcw } from 'lucide-react';

import { Button } from '~/shared/ui';

import {
  $disabledDownload,
  $downloadPending,
  $resizePercent,
  downloadResizedImageClicked,
  resizePercentReset,
} from '../model';

export function ResetButton() {
  const [resizePercent, onClick] = useUnit([
    $resizePercent,
    resizePercentReset,
  ]);

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={onClick}
      className="self-start"
      disabled={resizePercent === 100}
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
      className="w-full"
      disabled={disabledDownload || pending}
    >
      {pending ? (
        'Обработка и скачивание...'
      ) : (
        <>
          <Download size={18} className="mr-2" />
          Скачать измененное изображение
        </>
      )}
    </Button>
  );
}
