import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fileDownloadDirect } from '../file-download';

describe('fileDownloadDirect', () => {
  let createElementSpy: ReturnType<typeof vi.spyOn>;
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let mockLink: HTMLAnchorElement;
  let clickSpy: ReturnType<typeof vi.fn>;
  let removeSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Мокируем методы элемента <a>
    clickSpy = vi.fn();
    removeSpy = vi.fn();

    mockLink = {
      download: '',
      href: '',
      click: clickSpy,
      remove: removeSpy,
    } as unknown as HTMLAnchorElement;

    // Мокируем document.createElement
    createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(mockLink);

    // Мокируем URL методы
    createObjectURLSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:http://localhost/test-blob-url');
    revokeObjectURLSpy = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('должна создавать элемент <a> для скачивания', () => {
    const blob = new Blob(['test content'], { type: 'text/plain' });
    const filename = 'test.txt';

    fileDownloadDirect(blob, filename);

    expect(createElementSpy).toHaveBeenCalledWith('a');
  });

  it('должна устанавливать правильное имя файла', () => {
    const blob = new Blob(['test content'], { type: 'text/plain' });
    const filename = 'my-file.txt';

    fileDownloadDirect(blob, filename);

    expect(mockLink.download).toBe('my-file.txt');
  });

  it('должна создавать blob URL и устанавливать его в href', () => {
    const blob = new Blob(['test content'], { type: 'image/jpeg' });
    const filename = 'image.jpg';

    fileDownloadDirect(blob, filename);

    expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
    expect(mockLink.href).toBe('blob:http://localhost/test-blob-url');
  });

  it('должна вызывать click() на элементе', () => {
    const blob = new Blob(['test content'], { type: 'text/plain' });
    const filename = 'test.txt';

    fileDownloadDirect(blob, filename);

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('должна удалять элемент после клика', () => {
    const blob = new Blob(['test content'], { type: 'text/plain' });
    const filename = 'test.txt';

    fileDownloadDirect(blob, filename);

    expect(removeSpy).toHaveBeenCalledTimes(1);
  });

  it('должна отзывать blob URL после использования', () => {
    const blob = new Blob(['test content'], { type: 'text/plain' });
    const filename = 'test.txt';
    const blobUrl = 'blob:http://localhost/test-blob-url';

    fileDownloadDirect(blob, filename);

    expect(revokeObjectURLSpy).toHaveBeenCalledWith(blobUrl);
  });

  it('должна работать с разными типами файлов', () => {
    const imageBlob = new Blob(['image data'], { type: 'image/png' });
    const pdfBlob = new Blob(['pdf data'], { type: 'application/pdf' });

    fileDownloadDirect(imageBlob, 'image.png');
    expect(mockLink.download).toBe('image.png');

    fileDownloadDirect(pdfBlob, 'document.pdf');
    expect(mockLink.download).toBe('document.pdf');
  });

  it('должна работать с разными именами файлов', () => {
    const blob = new Blob(['test'], { type: 'text/plain' });

    fileDownloadDirect(blob, 'simple.txt');
    expect(mockLink.download).toBe('simple.txt');

    fileDownloadDirect(blob, 'file-with-dashes.txt');
    expect(mockLink.download).toBe('file-with-dashes.txt');

    fileDownloadDirect(blob, 'file.with.dots.txt');
    expect(mockLink.download).toBe('file.with.dots.txt');
  });

  it('должна выполнять все необходимые операции', () => {
    const blob = new Blob(['test'], { type: 'text/plain' });
    const filename = 'test.txt';

    fileDownloadDirect(blob, filename);

    // Проверяем, что все методы были вызваны
    expect(createElementSpy).toHaveBeenCalled();
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalled();
  });
});
