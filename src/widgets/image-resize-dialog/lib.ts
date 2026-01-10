import { loadImageFromUrl } from '~/shared/lib/load-image';

import type { ImageSize } from './model';

export async function getImageSizesFromUrl(url: string): Promise<ImageSize> {
  const revokeUrl = () => {
    // Освобождаем URL только если это blob URL
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };

  const img = await loadImageFromUrl(url, revokeUrl);

  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
  };
}

export async function getImageSizesFromBlob(file: File): Promise<ImageSize> {
  const url = URL.createObjectURL(file);
  const revokeUrl = () => {
    URL.revokeObjectURL(url);
  };

  const img = await loadImageFromUrl(url, revokeUrl);

  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
  };
}

/**
 * Вычисляет новые размеры изображения с сохранением пропорций на основе процента
 */
export function calculateResizedDimensions(
  originalWidth: number,
  originalHeight: number,
  percent: number,
): ImageSize {
  return {
    width: Math.round((originalWidth * percent) / 100),
    height: Math.round((originalHeight * percent) / 100),
  };
}

/**
 * Изменяет размер изображения на указанный процент через canvas
 */
async function resizeImageByPercent(
  image: HTMLImageElement,
  percent: number,
): Promise<Blob> {
  const { width, height } = calculateResizedDimensions(
    image.naturalWidth,
    image.naturalHeight,
    percent,
  );

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.drawImage(image, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      },
      'image/jpeg',
      0.95,
    );
  });
}

/**
 * Загружает изображение по URL и изменяет его размер на указанный процент
 * @param url - URL изображения
 * @param percent - Процент изменения размера (1-200)
 * @returns Promise с Blob измененного изображения
 */
export async function resizeImageFromUrl(
  url: string,
  percent: number,
): Promise<Blob> {
  const image = await loadImageFromUrl(url);
  return resizeImageByPercent(image, percent);
}

/**
 * Получает расширение файла из MIME типа
 */
export function getExtensionFromMime(mime: string): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return mimeMap[mime] || 'jpg';
}
