import {
  attach,
  combine,
  createEffect,
  createEvent,
  createStore,
  restore,
  sample,
} from 'effector';

import { imageUploadBaseFx } from '~/entities/image';

import { fileDownloadDirect } from '~/shared/lib/file-download';

import {
  calculateResizedDimensions,
  getExtensionFromMime,
  getImageSizesFromBlob,
  resizeImageFromUrl,
} from './lib';

export type ImageSize = {
  height: number;
  width: number;
};

// Эффект для скачивания измененного изображения
// Объединяет загрузку, изменение размера и скачивание в одну цепочку
const downloadResizedImageFx = createEffect<
  { imageUrl: string; percent: number; originalFile: File | null },
  void
>(async ({ imageUrl, percent, originalFile }) => {
  // Загружаем изображение и изменяем размер
  const blob = await resizeImageFromUrl(imageUrl, percent);

  // Скачиваем сразу
  const mime = blob.type || 'image/jpeg';
  const extension = getExtensionFromMime(mime);
  const defaultName = originalFile
    ? originalFile.name.replace(/\.[^.]+$/, `.${extension}`)
    : `resized-image.${extension}`;

  fileDownloadDirect(blob, defaultName);
});

const imageSizeFx = createEffect(getImageSizesFromBlob);
const imageUploadFx = attach({ effect: imageUploadBaseFx });

export const imageUploadStarted = createEvent<File>();

export const resizePercentChanged = createEvent<number>();
export const resizePercentReset = createEvent();
export const downloadResizedImageClicked = createEvent();

const $imageRaw = restore(imageUploadStarted, null).reset(
  imageUploadBaseFx.fail,
);

export const $imageSize = createStore<ImageSize>({
  height: 0,
  width: 0,
}).on(imageSizeFx.doneData, (_, res) => res);

export const $image = restore(imageUploadBaseFx.doneData, null).reset([
  imageUploadBaseFx.fail,
  imageUploadStarted,
]);

export const $resizePercent = restore(resizePercentChanged, 100).reset([
  imageUploadStarted,
  resizePercentReset,
]);

export const $resizedImageSize = createStore<ImageSize>({
  height: 0,
  width: 0,
}).reset(imageUploadStarted);

export const $downloadPending = downloadResizedImageFx.pending;

export const $disabledDownload = combine(
  $image,
  $resizePercent,
  (image, resizePercent) => {
    return !image || resizePercent === 100;
  },
);

// Обновляем размер при изменении исходного размера или процента
sample({
  clock: [$imageSize, $resizePercent],
  source: { imageSize: $imageSize, percent: $resizePercent },
  fn: ({ imageSize, percent }) => {
    if (imageSize.width === 0 || imageSize.height === 0) {
      return { width: 0, height: 0 };
    }
    return calculateResizedDimensions(
      imageSize.width,
      imageSize.height,
      percent,
    );
  },
  target: $resizedImageSize,
});

sample({
  clock: imageUploadStarted,
  target: imageUploadFx,
});

sample({
  clock: $imageRaw,
  filter: Boolean,
  target: imageSizeFx,
});

// Скачиваем изображение при клике - загружаем, изменяем размер и скачиваем
sample({
  clock: downloadResizedImageClicked,
  source: { image: $image, percent: $resizePercent, originalFile: $imageRaw },
  filter: ({ image }) => Boolean(image),
  fn: ({ image, percent, originalFile }) => ({
    imageUrl: image!,
    percent,
    originalFile,
  }),
  target: downloadResizedImageFx,
});
