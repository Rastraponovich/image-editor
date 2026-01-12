import { useRef } from 'react';

import { useUnit } from 'effector-react';
import { ImageOff } from 'lucide-react';

import { Button, FileInput } from '~/shared/ui';

import { $image, $resizeMode, imageUploadStarted } from './model';
import {
  Dialog as DialogC,
  DimensionsInputFields,
  Fieldset,
  FormActions,
  FormatSelect,
  ImageInfoSection,
  PercentInputField,
  QualitySlider,
  ResizeModeSelect,
} from './ui';

export function Dialog() {
  const [image, resizeMode] = useUnit([$image, $resizeMode]);

  return (
    <DialogC title="Изменение размера изображения">
      <div className="flex flex-col gap-y-4">
        <UploadButton />
        <div className="grid grid-cols-[1fr_minmax(200px,400px)] items-start gap-x-6">
          <Fieldset className="flex flex-col gap-y-4">
            <ImageInfoSection />

            <div className="flex flex-col gap-2">
              <ResizeModeSelect />
              {resizeMode === 'percent' ? (
                <PercentInputField />
              ) : (
                <DimensionsInputFields />
              )}
              <FormatSelect />
              <QualitySlider />
            </div>

            <FormActions />
          </Fieldset>

          <Preview image={image} />
        </div>
      </div>
    </DialogC>
  );
}

function Preview({ image }: { image?: string | null }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-zinc-600">Превью</p>
      <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        {image ? (
          <img
            src={image}
            alt="Original"
            className="max-h-[400px] max-w-full object-contain"
          />
        ) : (
          <ImageOff
            size={64}
            className="aspect-square text-zinc-400"
            aria-label="Изображение не загружено"
          />
        )}
      </div>
    </div>
  );
}

export function UploadButton() {
  const ref = useRef<HTMLInputElement>(null);
  const onUpload = useUnit(imageUploadStarted);

  return (
    <>
      <FileInput ref={ref} onChange={onUpload} />

      <Button onClick={() => ref.current?.click()} className="w-fit">
        загрузить изображение
      </Button>
    </>
  );
}
