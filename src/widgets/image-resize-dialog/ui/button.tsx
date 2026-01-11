import { useUnit } from 'effector-react';
import { Download, RotateCcw } from 'lucide-react';

import { Button } from '~/shared/ui';

import { PERCENT } from '../config';
import {
  $disabledDownload,
  $downloadPending,
  $imageSize,
  $resizeMode,
  $resizePercent,
  $resizedHeight,
  $resizedWidth,
  dialogInstance,
  downloadResizedImageClicked,
  resizeDimensionsReset,
  resizePercentReset,
} from '../model';

export function OpenButton() {
  const onClick = useUnit(dialogInstance.open);
  return <Button onClick={onClick}>Изменить размер</Button>;
}

export function ResetButton() {
  const [mode, resizePercent, imageSize, resizedWidth, resizedHeight] = useUnit(
    [$resizeMode, $resizePercent, $imageSize, $resizedWidth, $resizedHeight],
  );

  const onResetPercent = useUnit(resizePercentReset);
  const onResetDimensions = useUnit(resizeDimensionsReset);

  const onReset = mode === 'percent' ? onResetPercent : onResetDimensions;

  const isDisabled =
    mode === 'percent'
      ? resizePercent === PERCENT.DEFAULT
      : resizedWidth === imageSize.width && resizedHeight === imageSize.height;

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={onReset}
      className="self-start"
      disabled={isDisabled}
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
