import { fileDownloadDirect } from '~/shared/lib/file-download';
import { loadImageFromUrl } from '~/shared/lib/load-image';

import {
  CANVAS,
  type ImageSize,
  MIME_TO_EXTENSION,
  MIME_TYPES,
  PERCENT,
  ResizeMode,
  URL_PREFIXES,
} from './config';

/**
 * Получает размеры изображения по URL
 * @param url - URL изображения (может быть blob URL или обычный URL)
 * @returns Promise с размерами изображения (ширина и высота)
 * @throws {Error} Если не удалось загрузить изображение
 */
export async function getImageSizesFromUrl(url: string): Promise<ImageSize> {
  const revokeUrl = () => {
    // Освобождаем URL только если это blob URL
    if (url.startsWith(URL_PREFIXES.BLOB)) {
      URL.revokeObjectURL(url);
    }
  };

  const img = await loadImageFromUrl(url, revokeUrl);

  return { width: img.naturalWidth, height: img.naturalHeight };
}

/**
 * Получает размеры изображения из File объекта
 * @param file - File объект с изображением
 * @returns Promise с размерами изображения (ширина и высота)
 * @throws {Error} Если не удалось загрузить изображение
 */
export async function getImageSizesFromBlob(file: File): Promise<ImageSize> {
  const url = URL.createObjectURL(file);
  const revokeUrl = () => {
    URL.revokeObjectURL(url);
  };

  const img = await loadImageFromUrl(url, revokeUrl);

  return { width: img.naturalWidth, height: img.naturalHeight };
}

/**
 * Вычисляет новые размеры изображения с сохранением пропорций на основе процента
 * @param originalWidth - оригинальная ширина изображения
 * @param originalHeight - оригинальная высота изображения
 * @param percent - процент изменения размера (1-200)
 * @returns Новые размеры изображения с сохранением пропорций
 */
export function calculateResizedDimensions(
  originalWidth: number,
  originalHeight: number,
  percent: number,
): ImageSize {
  const { DIVISOR } = PERCENT;
  return {
    width: Math.round((originalWidth * percent) / DIVISOR),
    height: Math.round((originalHeight * percent) / DIVISOR),
  };
}

/**
 * Вычисляет пропорциональную сторону на основе измененной стороны
 * @param originalWidth - оригинальная ширина
 * @param originalHeight - оригинальная высота
 * @param changedValue - новое значение измененной стороны
 * @param changedSide - какая сторона была изменена ('width' или 'height')
 * @returns новое значение второй стороны
 */
export function calculateProportionalDimension(
  originalWidth: number,
  originalHeight: number,
  changedValue: number,
  changedSide: 'width' | 'height',
): number {
  if (originalWidth === 0 || originalHeight === 0) {
    return changedValue;
  }

  const aspectRatio = originalWidth / originalHeight;

  if (changedSide === 'width') {
    // Изменили ширину, вычисляем высоту
    return Math.round(changedValue / aspectRatio);
  } else {
    // Изменили высоту, вычисляем ширину
    return Math.round(changedValue * aspectRatio);
  }
}

/**
 * Определяет качество для формата изображения
 * @param mimeType - MIME тип изображения
 * @param requestedQuality - Запрошенное качество (опционально)
 * @returns Качество для формата или undefined для PNG
 */
function getQualityForFormat(
  mimeType: string,
  requestedQuality?: number,
): number | undefined {
  // PNG не поддерживает качество (lossless)
  if (mimeType === MIME_TYPES.PNG) {
    return undefined;
  }

  // Для форматов, поддерживающих качество, используем запрошенное или значение по умолчанию
  return requestedQuality ?? CANVAS.JPEG_QUALITY;
}

/**
 * Изменяет размер изображения на указанный процент через canvas
 * @param image - HTMLImageElement с загруженным изображением
 * @param percent - процент изменения размера (1-200)
 * @param outputFormat - MIME тип формата вывода (опционально)
 * @param quality - Качество сжатия (0.1-1.0), используется только для JPEG и WebP (опционально)
 * @returns Promise с Blob измененного изображения
 * @throws {Error} Если не удалось получить canvas context или создать blob
 */
async function resizeImageByPercent(
  image: HTMLImageElement,
  percent: number,
  outputFormat?: string,
  quality?: number,
): Promise<Blob> {
  const { width, height } = calculateResizedDimensions(
    image.naturalWidth,
    image.naturalHeight,
    percent,
  );

  return resizeImageByDimensions(image, width, height, outputFormat, quality);
}

/**
 * Создает Blob из canvas с указанным форматом и качеством
 * @param canvas - Canvas элемент
 * @param mimeType - MIME тип формата вывода
 * @param quality - Качество сжатия (опционально)
 * @returns Promise с Blob
 * @throws {Error} Если не удалось создать blob
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      },
      mimeType,
      quality,
    );
  });
}

/**
 * Изменяет размер изображения на указанные размеры через canvas
 * @param image - HTMLImageElement с загруженным изображением
 * @param width - новая ширина в пикселях
 * @param height - новая высота в пикселях
 * @param outputFormat - MIME тип формата вывода (опционально)
 * @param quality - Качество сжатия (0.1-1.0), используется только для JPEG и WebP (опционально)
 * @returns Promise с Blob измененного изображения
 * @throws {Error} Если не удалось получить canvas context или создать blob
 */
async function resizeImageByDimensions(
  image: HTMLImageElement,
  width: number,
  height: number,
  outputFormat?: string,
  quality?: number,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.drawImage(image, 0, 0, width, height);

  // Определяем MIME тип и качество
  const mimeType = outputFormat || CANVAS.DEFAULT_MIME_TYPE;
  const finalQuality = getQualityForFormat(mimeType, quality);

  return canvasToBlob(canvas, mimeType, finalQuality);
}

/**
 * Параметры для изменения размера изображения
 * @property mode - Режим изменения размера: 'percent' для процентов или 'dimensions' для размеров
 * @property imageUrl - URL изображения для изменения размера
 * @property percent - Процент изменения размера (1-200), используется только при mode === 'percent'
 * @property width - Ширина в пикселях, используется только при mode === 'dimensions'
 * @property height - Высота в пикселях, используется только при mode === 'dimensions'
 * @property outputFormat - MIME тип формата вывода (опционально)
 * @property quality - Качество сжатия (0.1-1.0), используется только для JPEG и WebP (опционально)
 */
export type ResizeImageParams =
  | {
      mode: 'percent';
      imageUrl: string;
      percent: number;
      outputFormat?: string;
      quality?: number;
    }
  | {
      mode: 'dimensions';
      imageUrl: string;
      width: number;
      height: number;
      outputFormat?: string;
      quality?: number;
    };

/**
 * Подготавливает параметры для изменения размера изображения
 * @param imageUrl - URL изображения для изменения размера
 * @param mode - Режим изменения размера (ResizeMode.percent или ResizeMode.dimensions)
 * @param percent - Процент изменения размера (1-200), используется только при mode === 'percent'
 * @param width - Ширина в пикселях, используется только при mode === 'dimensions'
 * @param height - Высота в пикселях, используется только при mode === 'dimensions'
 * @param outputFormat - MIME тип формата вывода (опционально)
 * @param quality - Качество сжатия (0.1-1.0), используется только для JPEG и WebP (опционально)
 * @returns Параметры для изменения размера изображения
 */
export function prepareResizeParams(
  imageUrl: string,
  mode: ResizeMode,
  percent: number,
  width: number,
  height: number,
  outputFormat?: string,
  quality?: number,
): ResizeImageParams {
  if (mode === ResizeMode.percent) {
    return { mode, imageUrl, percent, outputFormat, quality };
  } else {
    return { mode, imageUrl, width, height, outputFormat, quality };
  }
}

/**
 * Загружает изображение по URL и изменяет его размер
 * @param params - Параметры изменения размера (процент или размеры)
 * @returns Promise с Blob измененного изображения
 * @throws {Error} Если не удалось загрузить изображение, получить canvas context или создать blob
 */
export async function resizeImageFromUrl(
  params: ResizeImageParams,
): Promise<Blob> {
  const image = await loadImageFromUrl(params.imageUrl);

  if (params.mode === ResizeMode.dimensions) {
    // Режим размеров
    return resizeImageByDimensions(
      image,
      params.width,
      params.height,
      params.outputFormat,
      params.quality,
    );
  }

  // Режим процентов
  return resizeImageByPercent(
    image,
    params.percent,
    params.outputFormat,
    params.quality,
  );
}

/**
 * Получает расширение файла из MIME типа
 * @param mime - MIME тип изображения (например, 'image/jpeg', 'image/png')
 * @returns Расширение файла без точки (например, 'jpg', 'png')
 * @default 'jpg' - если MIME тип не распознан
 */
export function getExtensionFromMime(mime: string): string {
  return MIME_TO_EXTENSION[mime] || CANVAS.DEFAULT_EXTENSION;
}

/**
 * Параметры для скачивания измененного изображения
 */
export type DownloadResizedImageParams = {
  params: ResizeImageParams;
  originalFile: File | null;
};

/**
 * Загружает изображение, изменяет его размер и скачивает
 * @param downloadParams - Параметры для скачивания (параметры изменения размера и оригинальный файл)
 * @returns Promise<void>
 */
export async function downloadResizedImage({
  params,
  originalFile,
}: DownloadResizedImageParams): Promise<void> {
  // Загружаем изображение и изменяем размер
  const blob = await resizeImageFromUrl(params);

  // Определяем MIME тип для расширения файла
  // Приоритет: params.outputFormat > blob.type > originalFile.type > DEFAULT
  // Canvas должен правильно устанавливать blob.type, но на всякий случай есть fallback
  const mime =
    params.outputFormat ||
    blob.type ||
    originalFile?.type ||
    CANVAS.DEFAULT_MIME_TYPE;
  const extension = getExtensionFromMime(mime);

  // Формируем имя файла
  let defaultName: string;
  if (originalFile) {
    // Извлекаем имя файла без расширения из оригинала
    const match = originalFile.name.match(/^(.+?)(\.[^.]+)?$/);
    if (match) {
      const nameWithoutExtension = match[1];
      defaultName = `${nameWithoutExtension}_resized.${extension}`;
    } else {
      // Если нет расширения в оригинале
      defaultName = `${originalFile.name}_resized.${extension}`;
    }
  } else {
    defaultName = `resized-image.${extension}`;
  }

  fileDownloadDirect(blob, defaultName);
}

// Экспорт алиасов для тестирования внутренних функций
export {
  canvasToBlob as _canvasToBlob,
  getQualityForFormat as _getQualityForFormat,
  resizeImageByPercent as _resizeImageByPercent,
  resizeImageByDimensions as _resizeImageByDimensions,
};
