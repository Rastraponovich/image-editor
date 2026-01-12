import { allSettled, fork } from 'effector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadResizedImage } from '../lib';
import {
  $image,
  $outputFormat,
  $quality,
  $resizeMode,
  $resizePercent,
  $resizedHeight,
  $resizedWidth,
  _$imageRaw,
  _downloadResizedImageFx,
  _imageUploadFx,
  downloadResizedImageClicked,
  imageUploadStarted,
} from '../model';

// Мокируем функцию скачивания
vi.mock('../lib', async () => {
  const actual = await vi.importActual('../lib');
  return {
    ...actual,
    downloadResizedImage: vi.fn(),
  };
});

describe('downloadResizedImageFx', () => {
  let mockDownloadResizedImage: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDownloadResizedImage = vi.mocked(downloadResizedImage);
    mockDownloadResizedImage.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('должен вызывать downloadResizedImage с правильными параметрами при режиме percent', async () => {
    const mockFile = new File(['test'], 'my-image.jpg', {
      type: 'image/jpeg',
    });
    const imageUrl = 'blob:http://localhost/test';

    const downloadResizedImageFn = vi.fn().mockResolvedValue(undefined);
    const imageUploadFxFn = vi.fn().mockResolvedValue(imageUrl);

    const scope = fork({
      values: [
        [_$imageRaw, mockFile],
        [$resizeMode, 'percent'],
        [$resizePercent, 150],
        [$resizedWidth, 0],
        [$resizedHeight, 0],
        [$outputFormat, 'original'],
        [$quality, 1.0],
      ],
      handlers: [
        [_imageUploadFx, imageUploadFxFn],
        [_downloadResizedImageFx, downloadResizedImageFn],
      ],
    });

    // Загружаем файл (это установит $imageRaw через imageUploadStarted)
    await allSettled(_imageUploadFx, { scope, params: mockFile });
    expect(imageUploadFxFn).toHaveBeenCalledTimes(1);

    // Триггерим скачивание
    await allSettled(downloadResizedImageClicked, { scope });

    expect(downloadResizedImageFn).toHaveBeenCalledTimes(1);
    const callArgs = downloadResizedImageFn.mock.calls[0][0];

    expect(callArgs.originalFile).toBe(mockFile);
    expect(callArgs.params.mode).toBe('percent');
    expect(callArgs.params.percent).toBe(150);
    expect(callArgs.params.imageUrl).toBe(imageUrl);
    expect(callArgs.params.outputFormat).toBe('image/jpeg'); // 'original' преобразуется в undefined
  });

  it.todo('должен передавать originalFile из $imageRaw', async () => {
    const mockFile = new File(['test'], 'photo.png', { type: 'image/png' });
    const imageUrl = 'blob:http://localhost/test';

    const downloadResizedImageFn = vi.fn().mockResolvedValue(undefined);

    const scope = fork({
      values: [
        [$image, imageUrl],
        [$resizeMode, 'percent'],
        [$resizePercent, 100],
        [$resizedWidth, 0],
        [$resizedHeight, 0],
        [$outputFormat, 'original'],
        [$quality, 1.0],
      ],
      handlers: [
        [_imageUploadFx, async () => imageUrl],
        [_downloadResizedImageFx, downloadResizedImageFn],
      ],
    });

    // await allSettled(imageUploadStarted, { scope, params: mockFile });
    await allSettled(_imageUploadFx, { scope, params: mockFile });
    await allSettled(downloadResizedImageClicked, { scope });

    expect(mockDownloadResizedImage).toHaveBeenCalledTimes(1);
    const callArgs = mockDownloadResizedImage.mock.calls[0][0];

    // Проверяем, что originalFile передается
    expect(callArgs.originalFile).toBe(mockFile);
    expect(callArgs.originalFile?.name).toBe('photo.png');
  });

  it.todo('должен передавать outputFormat в параметрах', async () => {
    const mockFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' });
    const imageUrl = 'blob:http://localhost/test';

    const scope = fork({
      values: [
        [$image, imageUrl],
        [$resizeMode, 'percent'],
        [$resizePercent, 100],
        [$resizedWidth, 0],
        [$resizedHeight, 0],
        [$outputFormat, 'image/webp'],
        [$quality, 1.0],
      ],
      handlers: [[_imageUploadFx, async () => imageUrl]],
    });

    await allSettled(imageUploadStarted, { scope, params: mockFile });
    await allSettled(_imageUploadFx, { scope, params: mockFile });
    await allSettled(downloadResizedImageClicked, { scope });

    expect(mockDownloadResizedImage).toHaveBeenCalledTimes(1);
    const callArgs = mockDownloadResizedImage.mock.calls[0][0];

    expect(callArgs.params.outputFormat).toBe('image/webp');
    expect(callArgs.originalFile).toBe(mockFile);
  });

  it.todo('должен передавать quality в параметрах', async () => {
    const mockFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' });
    const imageUrl = 'blob:http://localhost/test';

    const scope = fork({
      values: [
        [$image, imageUrl],
        [$resizeMode, 'percent'],
        [$resizePercent, 100],
        [$resizedWidth, 0],
        [$resizedHeight, 0],
        [$outputFormat, 'original'],
        [$quality, 0.8],
      ],
      handlers: [[_imageUploadFx, async () => imageUrl]],
    });

    await allSettled(imageUploadStarted, { scope, params: mockFile });
    await allSettled(_imageUploadFx, { scope, params: mockFile });
    await allSettled(downloadResizedImageClicked, { scope });

    expect(mockDownloadResizedImage).toHaveBeenCalledTimes(1);
    const callArgs = mockDownloadResizedImage.mock.calls[0][0];

    expect(callArgs.params.quality).toBe(0.8);
    expect(callArgs.originalFile).toBe(mockFile);
  });

  it.todo('должен передавать параметры для режима dimensions', async () => {
    const mockFile = new File(['test'], 'photo.png', { type: 'image/png' });
    const imageUrl = 'blob:http://localhost/test';

    const fxMock = vi.fn().mockImplementation(async () => imageUrl);
    fxMock.mockResolvedValue(imageUrl);

    const scope = fork({
      values: [
        [$image, imageUrl],
        [$resizeMode, 'dimensions'],
        [$resizePercent, 100],
        [$resizedWidth, 800],
        [$resizedHeight, 600],
        [$outputFormat, 'original'],
        [$quality, 1.0],
      ],
      handlers: [[_imageUploadFx, fxMock]],
    });

    await allSettled(imageUploadStarted, { scope, params: mockFile });
    await allSettled(_imageUploadFx, { scope, params: mockFile });
    await allSettled(downloadResizedImageClicked, { scope });

    expect(mockDownloadResizedImage).toHaveBeenCalledTimes(1);
    const callArgs = mockDownloadResizedImage.mock.calls[0][0];

    expect(callArgs.params.mode).toBe('dimensions');
    expect(callArgs.params.width).toBe(800);
    expect(callArgs.params.height).toBe(600);
    expect(callArgs.originalFile).toBe(mockFile);
  });

  it('должен передавать null для originalFile если файл не загружен', async () => {
    const imageUrl = 'blob:http://localhost/test';

    const scope = fork({
      values: [
        [$image, imageUrl],
        [$resizeMode, 'percent'],
        [$resizePercent, 100],
        [$resizedWidth, 0],
        [$resizedHeight, 0],
        [$outputFormat, 'original'],
        [$quality, 1.0],
      ],
    });

    // Не загружаем файл, но устанавливаем image URL напрямую
    // Это симулирует ситуацию, когда image есть, но originalFile нет
    await allSettled(downloadResizedImageClicked, { scope });

    expect(mockDownloadResizedImage).toHaveBeenCalledTimes(1);
    const callArgs = mockDownloadResizedImage.mock.calls[0][0];

    // Проверяем, что originalFile null
    expect(callArgs.originalFile).toBeNull();
  });

  it('не должен вызывать эффект если нет изображения', async () => {
    const scope = fork({
      values: [
        [$image, null],
        [$resizeMode, 'percent'],
        [$resizePercent, 100],
        [$resizedWidth, 0],
        [$resizedHeight, 0],
        [$outputFormat, 'original'],
        [$quality, 1.0],
      ],
    });

    await allSettled(downloadResizedImageClicked, { scope });

    // Эффект не должен быть вызван из-за filter
    expect(mockDownloadResizedImage).not.toHaveBeenCalled();
  });
});
