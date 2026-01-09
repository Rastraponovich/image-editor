import { useId, useRef } from 'react';

import { useUnit } from 'effector-react';
import { Upload } from 'lucide-react';

import { imageUploadStarted } from '~/entities/image';

import { Button } from '~/shared/ui';

export function UploadImageButton() {
  const id = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onUpload = useUnit(imageUploadStarted);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.files = null;
    }
  };

  return (
    <>
      <input
        id={id}
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="sr-only"
        onChange={handleFileChange}
      />

      <Button
        size="sm"
        variant="secondary"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={18} className="mr-2" />
        Загрузить
      </Button>
    </>
  );
}
