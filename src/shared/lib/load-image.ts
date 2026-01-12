/**
 * Загружает изображение по URL и возвращает Promise с HTMLImageElement.
 * @param url - URL изображения
 * @param onRevokeUrl - Опциональный колбэк для освобождения ресурсов (например, blob URL)
 * @returns Promise с загруженным изображением
 */
export function loadImageFromUrl(
  url: string,
  onRevokeUrl?: () => void,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      if (onRevokeUrl) {
        onRevokeUrl();
      }
      resolve(img);
    };

    img.onerror = () => {
      if (onRevokeUrl) {
        onRevokeUrl();
      }
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
