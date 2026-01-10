import { useRef } from 'react';

import { useUnit } from 'effector-react';

import { FileInput } from '~/shared/ui';

import { $image, imageUploadStarted } from './model';
import {
  DownloadButton,
  ImageInfoSection,
  PercentSliderField,
  ResetButton,
} from './ui';

export function Dialog() {
  const image = useUnit($image);

  if (!image) {
    return (
      <div className="flex flex-col gap-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <p className="text-sm text-zinc-400">
          Загрузите изображение для изменения размера
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex gap-6">
        {/* Форма слева */}
        <div className="flex flex-1 flex-col gap-y-4">
          <h2 className="text-lg font-semibold text-zinc-100">
            Изменение размера изображения
          </h2>

          {/* Информация о размерах */}
          <ImageInfoSection />

          {/* Слайдер для процента */}
          <div className="flex flex-col gap-2">
            <PercentSliderField />
            <ResetButton />
          </div>

          {/* Кнопка скачивания */}
          <DownloadButton />
        </div>

        {/* Превью справа */}
        <Preview image={image} />
      </div>
    </div>
  );
}

function Preview({ image }: { image: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-zinc-400">Превью</p>
      <div className="flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <img
          src={image}
          alt="Original"
          className="max-h-[400px] max-w-full object-contain"
        />
      </div>
    </div>
  );
}

export function OpenButton() {
  const ref = useRef<HTMLInputElement>(null);
  const onUpload = useUnit(imageUploadStarted);

  return (
    <>
      <FileInput ref={ref} onChange={onUpload} />

      <button type="button" onClick={() => ref.current?.click()}>
        open
      </button>
    </>
  );
}
