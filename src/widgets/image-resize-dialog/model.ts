import { invoke } from '@withease/factories';
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

import { createDialogInstance } from '~/shared/lib/dialog-Instance';
import { fileDownloadDirect } from '~/shared/lib/file-download';

import { CANVAS, DEFAULT_IMAGE_SIZE, PERCENT, ResizeMode } from './config';
import {
  type ResizeImageParams,
  calculateProportionalDimension,
  calculateResizedDimensions,
  getExtensionFromMime,
  getImageSizesFromBlob,
  prepareResizeParams,
  resizeImageFromUrl,
} from './lib';

export type ImageSize = {
  height: number;
  width: number;
};

// Эффект для скачивания измененного изображения
// Объединяет загрузку, изменение размера и скачивание в одну цепочку
const downloadResizedImageFx = createEffect<
  { params: ResizeImageParams; originalFile: File | null },
  void
>(async ({ params, originalFile }) => {
  // Загружаем изображение и изменяем размер
  const blob = await resizeImageFromUrl(params);

  // Скачиваем сразу
  const mime = blob.type || CANVAS.DEFAULT_MIME_TYPE;
  const extension = getExtensionFromMime(mime);
  const defaultName = originalFile
    ? originalFile.name.replace(/\.[^.]+$/, `.${extension}`)
    : `resized-image.${extension}`;

  fileDownloadDirect(blob, defaultName);
});

const imageSizeFx = createEffect(getImageSizesFromBlob);
const imageUploadFx = attach({ effect: imageUploadBaseFx });

export const imageUploadStarted = createEvent<File>();

// Режим пересчета
export const resizeModeChanged = createEvent<ResizeMode>();
export const $resizeMode = restore(resizeModeChanged, ResizeMode.percent);

// Режим процентов
export const resizePercentChanged = createEvent<number>();
export const resizePercentReset = createEvent();

// Режим размеров
export const resizedWidthChanged = createEvent<number>();
export const resizedHeightChanged = createEvent<number>();
export const resizeDimensionsReset = createEvent();

export const downloadResizedImageClicked = createEvent();

const resetValues = createEvent();

const $imageRaw = restore(imageUploadStarted, null);

export const $imageSize = createStore<ImageSize>(DEFAULT_IMAGE_SIZE).on(
  imageSizeFx.doneData,
  (_, res) => res,
);

export const $image = restore(imageUploadBaseFx.doneData, null);

export const $resizePercent = restore(
  resizePercentChanged,
  PERCENT.DEFAULT,
).reset([resizePercentReset]);

// Режим размеров: stores для ширины и высоты
export const $resizedWidth = createStore(0);
export const $resizedHeight = createStore(0);

export const $resizedImageSize = createStore<ImageSize>(DEFAULT_IMAGE_SIZE);

export const dialogInstance = invoke(() =>
  createDialogInstance({ onAfterClosed: resetValues }),
);

export const $downloadPending = downloadResizedImageFx.pending;

export const $disabledDownload = combine(
  $image,
  $resizeMode,
  $resizePercent,
  $imageSize,
  $resizedWidth,
  $resizedHeight,
  (image, mode, resizePercent, imageSize, resizedWidth, resizedHeight) => {
    if (!image) return true;

    if (mode === ResizeMode.percent) {
      return resizePercent === PERCENT.DEFAULT;
    } else {
      return (
        resizedWidth === imageSize.width && resizedHeight === imageSize.height
      );
    }
  },
);

// Инициализация размеров при загрузке изображения
sample({
  clock: $imageSize,
  filter: size => size.width > 0 && size.height > 0,
  fn: size => size.width,
  target: $resizedWidth,
});

sample({
  clock: $imageSize,
  filter: size => size.width > 0 && size.height > 0,
  fn: size => size.height,
  target: $resizedHeight,
});

// Сброс размеров на оригинальные
sample({
  clock: resizeDimensionsReset,
  source: $imageSize,
  fn: size => size.width,
  target: $resizedWidth,
});

sample({
  clock: resizeDimensionsReset,
  source: $imageSize,
  fn: size => size.height,
  target: $resizedHeight,
});

// Обновляем размер при изменении исходного размера или процента (режим процентов)
sample({
  clock: [$imageSize, $resizePercent, $resizeMode],
  source: {
    imageSize: $imageSize,
    percent: $resizePercent,
    mode: $resizeMode,
  },
  filter: ({ mode }) => mode === ResizeMode.percent,
  fn: ({ imageSize, percent }) => {
    if (imageSize.width === 0 || imageSize.height === 0) {
      return DEFAULT_IMAGE_SIZE;
    }

    return calculateResizedDimensions(
      imageSize.width,
      imageSize.height,
      percent,
    );
  },
  target: $resizedImageSize,
});

// При переключении на режим размеров, сбрасываем размеры до оригинальных
sample({
  clock: $resizeMode,
  source: $imageSize,
  fn: imageSize => imageSize.width,
  target: $resizedWidth,
});

sample({
  clock: $resizeMode,
  source: $imageSize,
  fn: imageSize => imageSize.height,
  target: $resizedHeight,
});

// При переключении на режим процентов, сбрасываем процент до значения по умолчанию
sample({
  clock: $resizeMode,
  fn: () => PERCENT.DEFAULT,
  target: $resizePercent,
});

// Обновляем размер при изменении ширины/высоты (режим размеров)
sample({
  clock: [$resizedWidth, $resizedHeight],
  source: { width: $resizedWidth, height: $resizedHeight },
  fn: ({ width, height }) => ({ width, height }),
  target: $resizedImageSize,
});

// Логика пересчета пропорций при изменении ширины (режим размеров)
// Всегда обновляем ширину
sample({
  clock: resizedWidthChanged,
  source: { mode: $resizeMode },
  filter: ({ mode }) => mode === ResizeMode.dimensions,
  fn: (_, newWidth) => newWidth,
  target: $resizedWidth,
});

// Всегда пересчитываем высоту пропорционально
sample({
  clock: resizedWidthChanged,
  source: { mode: $resizeMode, imageSize: $imageSize },
  filter: ({ mode, imageSize }) =>
    mode === ResizeMode.dimensions &&
    imageSize.width > 0 &&
    imageSize.height > 0,
  fn: ({ imageSize }, newWidth) =>
    calculateProportionalDimension(
      imageSize.width,
      imageSize.height,
      newWidth,
      'width',
    ),
  target: $resizedHeight,
});

// Логика пересчета пропорций при изменении высоты (режим размеров)
// Всегда обновляем высоту
sample({
  clock: resizedHeightChanged,
  source: { mode: $resizeMode },
  filter: ({ mode }) => mode === ResizeMode.dimensions,
  fn: (_, newHeight) => newHeight,
  target: $resizedHeight,
});

// Всегда пересчитываем ширину пропорционально
sample({
  clock: resizedHeightChanged,
  source: {
    mode: $resizeMode,
    imageSize: $imageSize,
  },
  filter: ({ mode, imageSize }) =>
    mode === ResizeMode.dimensions &&
    imageSize.width > 0 &&
    imageSize.height > 0,
  fn: ({ imageSize }, newHeight) =>
    calculateProportionalDimension(
      imageSize.width,
      imageSize.height,
      newHeight,
      'height',
    ),
  target: $resizedWidth,
});

sample({
  clock: imageUploadStarted,
  target: imageUploadFx,
});

sample({ clock: $imageRaw, filter: Boolean, target: imageSizeFx });

// Скачиваем изображение при клике - загружаем, изменяем размер и скачиваем
sample({
  clock: downloadResizedImageClicked,
  source: {
    image: $image,
    mode: $resizeMode,
    percent: $resizePercent,
    width: $resizedWidth,
    height: $resizedHeight,
    originalFile: $imageRaw,
  },
  filter: ({ image }) => Boolean(image),
  fn: ({ image, mode, percent, width, height, originalFile }) => ({
    params: prepareResizeParams(image!, mode, percent, width, height),
    originalFile,
  }),
  target: downloadResizedImageFx,
});

sample({
  clock: [imageUploadBaseFx.fail, imageUploadStarted],
  target: resetValues,
});

sample({
  clock: resetValues,
  target: [
    $imageRaw.reinit,
    $image.reinit,
    $imageSize.reinit,
    $resizePercent.reinit,
    $resizedWidth.reinit,
    $resizedHeight.reinit,
    $resizedImageSize.reinit,
  ],
});
