import { attach, createEvent, sample } from 'effector';

import { $canvas, $imageQuality, $imageRaw } from '~/entities/image';

export const donwloadButtonClicked = createEvent();

/**
 * Конвертирует dataURL в Blob
 */
function dataURLToBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Получает расширение файла из MIME типа
 */
function getExtensionFromMime(mime: string): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return mimeMap[mime] || 'jpg';
}

export const downloadImageFx = attach({
  source: { image: $imageRaw, quality: $imageQuality, editor: $canvas },
  effect: async ({ image, quality, editor }) => {
    if (!image) {
      throw new Error('no image to download');
    }

    const dataUrl = editor.toDataURL(
      image.type, // Используем исходный тип (image/png, image/jpeg и т.д.)
      quality / 100,
    );

    if (!dataUrl) {
      throw new Error('cannot generate image data');
    }

    const blob = dataURLToBlob(dataUrl);
    const mime = image.type || 'image/jpeg';
    const extension = getExtensionFromMime(mime);
    const defaultName = image.name
      ? image.name.replace(/\.[^.]+$/, `.${extension}`)
      : `edited-image.${extension}`;

    // Пробуем использовать File System Access API (современные браузеры)
    if ('showSaveFilePicker' in globalThis.window) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fileHandle = await (globalThis.window as any).showSaveFilePicker({
          suggestedName: defaultName,
          types: [
            {
              description: 'Image files',
              accept: {
                [mime]: [`.${extension}`],
              },
            },
          ],
        });

        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        {
          return true;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        // Пользователь отменил диалог - это нормально, не бросаем ошибку
        if (error.name === 'AbortError') {
          return false;
        }
        // Если произошла другая ошибка, пробуем fallback на скачивание
      }
    }

    // Fallback: скачивание через <a> элемент (для старых браузеров)
    const link = document.createElement('a');
    link.download = defaultName;
    link.href = URL.createObjectURL(blob);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
    return true;
  },
});

export const $pending = downloadImageFx.pending;

sample({
  clock: donwloadButtonClicked,
  target: downloadImageFx,
});
