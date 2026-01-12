import { allSettled, fork } from 'effector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  $canvas,
  imageQualityChanged,
  imageUploadStarted,
} from '~/entities/image';

import { donwloadButtonClicked, downloadImageFx } from '../model';

describe('Download Image Feature', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockEditor: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockLink: any;
  let createElementSpy: ReturnType<typeof vi.spyOn>;
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEditor = {
      toDataURL: vi.fn().mockReturnValue('data:image/jpeg;base64,dGVzdA=='),
      getCanvas: vi.fn(),
    };

    mockLink = {
      download: '',
      href: '',
      click: vi.fn(),
      remove: vi.fn(),
    };

    // Mock document.createElement using vi.spyOn
    createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation((tag: string) => {
        if (tag === 'a') {
          return mockLink as unknown as HTMLElement;
        }
        return document.createElement(tag);
      });

    // Mock URL methods using vi.spyOn
    createObjectURLSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:test');

    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    // Mock window using vi.stubGlobal
    vi.stubGlobal('window', {
      ...globalThis.window,
      showSaveFilePicker: undefined,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should throw error if no image is loaded', async () => {
    const scope = fork({
      values: [[$canvas, mockEditor]],
    });

    // Проверяем, что эффект завершится с ошибкой при отсутствии изображения
    const result = await allSettled(downloadImageFx, {
      scope,
      // @ts-expect-error - testing error case with null image
      params: { image: null, quality: 100, editor: mockEditor },
    });
    expect(result.status).toBe('fail');
    if (result.status === 'fail') {
      expect(result.value.message).toBe('no image to download');
    }
  });

  it('should use File System Access API when available', async () => {
    const mockFileHandle = {
      createWritable: vi.fn().mockResolvedValue({
        write: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
      }),
    };

    const mockShowSaveFilePicker = vi.fn().mockResolvedValue(mockFileHandle);

    // Use vi.stubGlobal for window
    vi.stubGlobal('window', {
      ...globalThis.window,
      showSaveFilePicker: mockShowSaveFilePicker,
    });

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const scope = fork({
      values: [[$canvas, mockEditor]],
    });

    await allSettled(imageUploadStarted, { scope, params: mockFile });
    await allSettled(donwloadButtonClicked, { scope });

    expect(mockShowSaveFilePicker).toHaveBeenCalledWith({
      suggestedName: 'test.jpg',
      types: [
        {
          description: 'Image files',
          accept: {
            'image/jpeg': ['.jpg'],
          },
        },
      ],
    });
    expect(mockFileHandle.createWritable).toHaveBeenCalled();
  });

  it('should fallback to download link if File System API is not available', async () => {
    // Use vi.stubGlobal for window
    vi.stubGlobal('window', {
      ...globalThis.window,
      showSaveFilePicker: undefined,
    });

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const scope = fork({
      values: [[$canvas, mockEditor]],
    });

    await allSettled(imageUploadStarted, { scope, params: mockFile });
    await allSettled(donwloadButtonClicked, { scope });

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockLink.download).toBe('test.jpg');
    expect(createObjectURLSpy).toHaveBeenCalled();
  });

  it('should handle user cancellation gracefully', async () => {
    const mockShowSaveFilePicker = vi.fn().mockRejectedValue({
      name: 'AbortError',
    });

    // Use vi.stubGlobal for window
    vi.stubGlobal('window', {
      ...globalThis.window,
      showSaveFilePicker: mockShowSaveFilePicker,
    });

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const scope = fork({
      values: [[$canvas, mockEditor]],
    });

    await allSettled(imageUploadStarted, { scope, params: mockFile });
    await allSettled(donwloadButtonClicked, { scope });

    // При отмене пользователем эффект должен завершиться успешно (возвращает false)
    expect(mockShowSaveFilePicker).toHaveBeenCalled();
    // Проверяем, что fallback на скачивание не был вызван
    expect(createElementSpy).not.toHaveBeenCalledWith('a');
  });

  it('should convert dataURL to Blob correctly', async () => {
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
    const scope = fork({
      values: [[$canvas, mockEditor]],
    });

    await allSettled(imageUploadStarted, { scope, params: mockFile });
    await allSettled(imageQualityChanged, { scope, params: 80 });
    await allSettled(donwloadButtonClicked, { scope });

    // Проверяем, что toDataURL был вызван с правильными параметрами
    expect(mockEditor.toDataURL).toHaveBeenCalledWith('image/png', 0.8);
  });

  it('should use correct file extension based on MIME type', async () => {
    const mockFile = new File(['test'], 'test.webp', { type: 'image/webp' });
    const scope = fork({
      values: [[$canvas, mockEditor]],
    });

    await allSettled(imageUploadStarted, { scope, params: mockFile });
    await allSettled(donwloadButtonClicked, { scope });

    expect(mockLink.download).toBe('test.webp');
  });
});
