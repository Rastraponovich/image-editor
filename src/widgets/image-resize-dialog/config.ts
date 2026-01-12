/**
 * Константы для виджета изменения размера изображения
 */

// Режимы изменения размера
export const ResizeMode = {
  percent: 'percent',
  dimensions: 'dimensions',
} as const;

export type ResizeMode = (typeof ResizeMode)[keyof typeof ResizeMode];

// Проценты изменения размера
export const PERCENT = {
  MIN: 1,
  MAX: 200,
  DEFAULT: 100,
  DIVISOR: 100, // Делитель для расчета процентов (100%)
} as const;

// MIME типы изображений
export const MIME_TYPES = {
  JPEG: 'image/jpeg',
  JPG: 'image/jpg',
  PNG: 'image/png',
  WEBP: 'image/webp',
  GIF: 'image/gif',
} as const;

// Расширения файлов
export const FILE_EXTENSIONS = {
  JPG: 'jpg',
  PNG: 'png',
  WEBP: 'webp',
  GIF: 'gif',
} as const;

// Маппинг MIME типов на расширения файлов
export const MIME_TO_EXTENSION: Record<string, string> = {
  [MIME_TYPES.JPEG]: FILE_EXTENSIONS.JPG,
  [MIME_TYPES.JPG]: FILE_EXTENSIONS.JPG,
  [MIME_TYPES.PNG]: FILE_EXTENSIONS.PNG,
  [MIME_TYPES.WEBP]: FILE_EXTENSIONS.WEBP,
  [MIME_TYPES.GIF]: FILE_EXTENSIONS.GIF,
};

// Настройки качества
export const QUALITY = {
  MIN: 0.1,
  MAX: 1.0,
  DEFAULT: 1.0,
  STEP: 0.05,
} as const;

// Настройки для canvas
export const CANVAS = {
  JPEG_QUALITY: QUALITY.DEFAULT,
  DEFAULT_MIME_TYPE: MIME_TYPES.JPEG,
  DEFAULT_EXTENSION: FILE_EXTENSIONS.JPG,
} as const;

// Префиксы URL
export const URL_PREFIXES = {
  BLOB: 'blob:',
} as const;

// Минимальные размеры
export const MIN_DIMENSION = 1;

export const DEFAULT_IMAGE_SIZE = {
  height: 0,
  width: 0,
};

export type ImageSize = {
  height: number;
  width: number;
};
