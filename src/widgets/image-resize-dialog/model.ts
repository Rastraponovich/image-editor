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

import {
  CANVAS,
  DEFAULT_IMAGE_SIZE,
  type ImageSize,
  MIME_TYPES,
  PERCENT,
  QUALITY,
  ResizeMode,
} from './config';
import {
  calculateProportionalDimension,
  calculateResizedDimensions,
  downloadResizedImage,
  getImageSizesFromBlob,
  prepareResizeParams,
} from './lib';

// Эффект для скачивания измененного изображения
const downloadResizedImageFx = createEffect(downloadResizedImage);

const imageSizeFx = createEffect(getImageSizesFromBlob);
const imageUploadFx = attach({ effect: imageUploadBaseFx });

export const imageUploadStarted = createEvent<File>();

// Режим пересчета
export const resizeModeChanged = createEvent<ResizeMode>();
export const $resizeMode = restore(resizeModeChanged, ResizeMode.percent);

// Режим процентов
export const resizePercentChanged = createEvent<number>();
export const resizePercentReset = createEvent();

export const resetButtonClicked = createEvent();

// Режим размеров
export const resizedWidthChanged = createEvent<number>();
export const resizedHeightChanged = createEvent<number>();
const resizeDimensionsReset = createEvent();

export const downloadResizedImageClicked = createEvent();

// Формат вывода
export const outputFormatChanged = createEvent<string>();

// Качество сжатия
export const qualityChanged = createEvent<number>();
export const qualityReset = createEvent();

const formReinit = createEvent();

const $imageRaw = createStore<File | null>(null).on(
  imageUploadFx.done,
  (_, response) => response.params,
);

export const $imageSize = createStore<ImageSize>(DEFAULT_IMAGE_SIZE).on(
  imageSizeFx.doneData,
  (_, res) => res,
);

export const $image = restore(imageUploadFx.doneData, null);

export const $resizePercent = restore(
  resizePercentChanged,
  PERCENT.DEFAULT,
).reset([resizePercentReset]);

// Режим размеров: stores для ширины и высоты
export const $resizedWidth = createStore(0);
export const $resizedHeight = createStore(0);

export const $resizedImageSize = createStore<ImageSize>(DEFAULT_IMAGE_SIZE);

export const $outputFormat = restore(
  outputFormatChanged,
  CANVAS.DEFAULT_MIME_TYPE,
)
  .on(imageUploadFx.done, (_, { params }) => params.type)
  .reset(formReinit);

// Сохраняем исходный формат файла для сравнения
const $originalFileFormat = createStore<string>(CANVAS.DEFAULT_MIME_TYPE).reset(
  [formReinit],
);

export const $quality = restore(qualityChanged, QUALITY.DEFAULT).reset([
  qualityReset,
  formReinit,
]);

export const dialogInstance = invoke(() =>
  createDialogInstance({ onAfterClosed: formReinit }),
);

export const $downloadPending = downloadResizedImageFx.pending;

export const $disabledDownload = combine(
  $image,
  $resizeMode,
  $resizePercent,
  $imageSize,
  $resizedWidth,
  $resizedHeight,
  $outputFormat,
  $originalFileFormat,
  $quality,
  (
    image,
    mode,
    resizePercent,
    imageSize,
    resizedWidth,
    resizedHeight,
    outputFormat,
    originalFileFormat,
    quality,
  ) => {
    if (!image) {
      return true;
    }

    // Если формат изменен от исходного, кнопка должна быть активна
    if (outputFormat !== originalFileFormat) {
      return false;
    }

    // Если качество изменено, кнопка должна быть активна
    if (quality !== QUALITY.DEFAULT) {
      return false;
    }

    if (mode === ResizeMode.percent) {
      return resizePercent === PERCENT.DEFAULT;
    }

    return (
      resizedWidth === imageSize.width && resizedHeight === imageSize.height
    );
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

// Устанавливаем формат вывода из типа загруженного файла
sample({
  clock: imageUploadStarted,
  filter: (file: File) => {
    // Проверяем, что тип файла поддерживается
    const supportedTypes = [
      MIME_TYPES.JPEG,
      MIME_TYPES.JPG,
      MIME_TYPES.PNG,
      MIME_TYPES.WEBP,
      MIME_TYPES.GIF,
    ];
    return supportedTypes.includes(
      file.type as (typeof MIME_TYPES)[keyof typeof MIME_TYPES],
    );
  },
  fn: (file: File) => file.type || CANVAS.DEFAULT_MIME_TYPE,
  target: [outputFormatChanged, $originalFileFormat],
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
    outputFormat: $outputFormat,
    quality: $quality,
  },
  filter: ({ image }) => Boolean(image),
  fn: ({
    image,
    mode,
    percent,
    width,
    height,
    originalFile,
    outputFormat,
    quality,
  }) => ({
    params: prepareResizeParams(
      image!,
      mode,
      percent,
      width,
      height,
      outputFormat,
      quality,
    ),
    originalFile,
  }),
  target: downloadResizedImageFx,
});

sample({
  clock: resetButtonClicked,
  target: [resizePercentReset, resizeDimensionsReset, qualityReset],
});

sample({
  clock: [imageUploadFx.fail, imageUploadStarted, dialogInstance.afterClosed],
  target: formReinit,
});

sample({
  clock: formReinit,
  target: [
    $imageRaw.reinit,
    $image.reinit,
    $imageSize.reinit,
    $resizePercent.reinit,
    $resizedWidth.reinit,
    $resizedHeight.reinit,
    $resizedImageSize.reinit,
    $outputFormat.reinit,
    $quality.reinit,
  ],
});

// testing exports
export {
  downloadResizedImageFx as _downloadResizedImageFx,
  imageUploadFx as _imageUploadFx,
  imageSizeFx as _imageSizeFx,
  $imageRaw as _$imageRaw,
};
