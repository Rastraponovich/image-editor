/**
 * Скачивает файл напрямую без диалога выбора места сохранения
 * @param blob - Blob файла для скачивания
 * @param filename - Имя файла для скачивания
 */
export function fileDownloadDirect(blob: Blob, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = URL.createObjectURL(blob);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}
