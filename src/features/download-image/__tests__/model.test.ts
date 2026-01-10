/* eslint-disable @typescript-eslint/ban-ts-comment */
import { allSettled, fork } from 'effector';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

    // Mock document.createElement

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).document.createElement = vi
      .fn()
      .mockImplementation((tag: string) => {
        if (tag === 'a') {
          return mockLink;
        }
        return document.createElement(tag);
      });

    // Mock URL methods

    // @ts-ignore
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test');

    // @ts-ignore
    global.URL.revokeObjectURL = vi.fn();

    // Mock window

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).window = {
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(global as any).window,
      showSaveFilePicker: undefined,
    };
  });

  it('should throw error if no image is loaded', async () => {
    const scope = fork({
      values: [[$canvas, mockEditor]],
    });

    // Проверяем, что эффект завершится с ошибкой при отсутствии изображения
    const result = await allSettled(downloadImageFx, {
      scope,
      // @ts-expect-error
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
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).window = {
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(global as any).window,
      showSaveFilePicker: mockShowSaveFilePicker,
    };

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
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).window = {
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(global as any).window,
      showSaveFilePicker: undefined,
    };
    // @ts-ignore
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const scope = fork({
      values: [[$canvas, mockEditor]],
    });

    await allSettled(imageUploadStarted, { scope, params: mockFile });
    await allSettled(donwloadButtonClicked, { scope });

    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockLink.download).toBe('test.jpg');
    // @ts-ignore
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it('should handle user cancellation gracefully', async () => {
    const mockShowSaveFilePicker = vi.fn().mockRejectedValue({
      name: 'AbortError',
    });
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).window = {
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(global as any).window,
      showSaveFilePicker: mockShowSaveFilePicker,
    };

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const scope = fork({
      values: [[$canvas, mockEditor]],
    });

    await allSettled(imageUploadStarted, { scope, params: mockFile });
    await allSettled(donwloadButtonClicked, { scope });

    // При отмене пользователем эффект должен завершиться успешно (возвращает false)
    expect(mockShowSaveFilePicker).toHaveBeenCalled();
    // Проверяем, что fallback на скачивание не был вызван
    expect(document.createElement).not.toHaveBeenCalledWith('a');
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
