import { useUnit } from 'effector-react';
import { Download } from 'lucide-react';

import { $image } from '~/entities/image';

import { Button } from '~/shared/ui';

import { $pending, donwloadButtonClicked } from './model';

export function DownloadImageButton() {
  const [handleDownload, image, pending] = useUnit([
    donwloadButtonClicked,
    $image,
    $pending,
  ]);

  return (
    <Button
      size="sm"
      variant="primary"
      onClick={handleDownload}
      disabled={!image || pending}
    >
      <Download size={18} className="mr-2" />
      Скачать
    </Button>
  );
}
