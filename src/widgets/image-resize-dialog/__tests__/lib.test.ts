import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getImageSizesFromBlob,
  getImageSizesFromUrl,
  resizeImageFromUrl,
} from '../lib';

describe('getImageSizesFromBlob', () => {
  interface ImageMockInstance {
    onload: (() => void) | null;
    onerror: ((error: Event | string) => void) | null;
    naturalWidth: number;
    naturalHeight: number;
  }

  let mockFile: File;
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let ImageMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Создаем мок File объекта
    mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    // Мокируем URL методы
    createObjectURLSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:http://localhost/test');
    revokeObjectURLSpy = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => {});

    // Создаем общий мок Image
    ImageMock = vi.fn(function ImageMock(this: ImageMockInstance) {
      this.onload = null;
      this.onerror = null;
      this.naturalWidth = 0;
      this.naturalHeight = 0;
      Object.defineProperty(this, 'src', {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(_value: string) {
          setTimeout(() => {
            if (this.onload) {
              this.onload();
            }
          }, 0);
        },
      });
    });

    vi.stubGlobal('Image', ImageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('должна возвращать размеры изображения при успешной загрузке', async () => {
    ImageMock.mockImplementation(function ImageMock(this: ImageMockInstance) {
      this.onload = null;
      this.onerror = null;
      this.naturalWidth = 1920;
      this.naturalHeight = 1080;
      Object.defineProperty(this, 'src', {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(_value: string) {
          setTimeout(() => {
            if (this.onload) {
              this.onload();
            }
          }, 0);
        },
      });
    });

    const result = await getImageSizesFromBlob(mockFile);

    expect(result).toEqual({
      width: 1920,
      height: 1080,
    });
    expect(createObjectURLSpy).toHaveBeenCalledWith(mockFile);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith(
      'blob:http://localhost/test',
    );
  });

  it('должна обрабатывать изображения разных размеров', async () => {
    ImageMock.mockImplementation(function ImageMock(this: ImageMockInstance) {
      this.onload = null;
      this.onerror = null;
      this.naturalWidth = 800;
      this.naturalHeight = 600;
      Object.defineProperty(this, 'src', {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(_value: string) {
          setTimeout(() => {
            if (this.onload) {
              this.onload();
            }
          }, 0);
        },
      });
    });

    const result = await getImageSizesFromBlob(mockFile);

    expect(result).toEqual({
      width: 800,
      height: 600,
    });
  });

  it('должна обрабатывать квадратные изображения', async () => {
    ImageMock.mockImplementation(function ImageMock(this: ImageMockInstance) {
      this.onload = null;
      this.onerror = null;
      this.naturalWidth = 500;
      this.naturalHeight = 500;
      Object.defineProperty(this, 'src', {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(_value: string) {
          setTimeout(() => {
            if (this.onload) {
              this.onload();
            }
          }, 0);
        },
      });
    });

    const result = await getImageSizesFromBlob(mockFile);

    expect(result).toEqual({
      width: 500,
      height: 500,
    });
  });

  it('должна выбрасывать ошибку при неудачной загрузке изображения', async () => {
    ImageMock.mockImplementation(function ImageMock(this: ImageMockInstance) {
      this.onload = null;
      this.onerror = null;
      this.naturalWidth = 0;
      this.naturalHeight = 0;
      Object.defineProperty(this, 'src', {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(_value: string) {
          setTimeout(() => {
            if (this.onerror) {
              // Создаем Event объект для onerror
              const errorEvent = new Event('error') as ErrorEvent;
              this.onerror(errorEvent);
            }
          }, 0);
        },
      });
    });

    await expect(getImageSizesFromBlob(mockFile)).rejects.toThrow(
      'Failed to load image',
    );
    expect(revokeObjectURLSpy).toHaveBeenCalled();
  });

  it('должна освобождать URL даже при ошибке', async () => {
    ImageMock.mockImplementation(function ImageMock(this: ImageMockInstance) {
      this.onload = null;
      this.onerror = null;
      this.naturalWidth = 0;
      this.naturalHeight = 0;
      Object.defineProperty(this, 'src', {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(_value: string) {
          setTimeout(() => {
            if (this.onerror) {
              // Создаем Event объект для onerror
              const errorEvent = new Event('error') as ErrorEvent;
              this.onerror(errorEvent);
            }
          }, 0);
        },
      });
    });

    try {
      await getImageSizesFromBlob(mockFile);
    } catch {
      // Игнорируем ошибку
    }

    expect(revokeObjectURLSpy).toHaveBeenCalledWith(
      'blob:http://localhost/test',
    );
  });
});

describe('getImageSizesFromUrl', () => {
  interface ImageMockInstance {
    onload: (() => void) | null;
    onerror: ((error: Event | string) => void) | null;
    naturalWidth: number;
    naturalHeight: number;
  }

  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let ImageMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Мокируем URL методы
    revokeObjectURLSpy = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => {});

    // Создаем общий мок Image
    ImageMock = vi.fn(function ImageMock(this: ImageMockInstance) {
      this.onload = null;
      this.onerror = null;
      this.naturalWidth = 0;
      this.naturalHeight = 0;
      Object.defineProperty(this, 'src', {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(_value: string) {
          setTimeout(() => {
            if (this.onload) {
              this.onload();
            }
          }, 0);
        },
      });
    });

    vi.stubGlobal('Image', ImageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('должна возвращать размеры изображения при успешной загрузке blob URL', async () => {
    ImageMock.mockImplementation(function ImageMock(this: ImageMockInstance) {
      this.onload = null;
      this.onerror = null;
      this.naturalWidth = 1920;
      this.naturalHeight = 1080;
      Object.defineProperty(this, 'src', {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(_value: string) {
          setTimeout(() => {
            if (this.onload) {
              this.onload();
            }
          }, 0);
        },
      });
    });

    const blobUrl = 'blob:http://localhost/test';
    const result = await getImageSizesFromUrl(blobUrl);

    expect(result).toEqual({
      width: 1920,
      height: 1080,
    });
    expect(revokeObjectURLSpy).toHaveBeenCalledWith(blobUrl);
  });

  it('должна возвращать размеры изображения при успешной загрузке обычного URL', async () => {
    ImageMock.mockImplementation(function ImageMock(this: ImageMockInstance) {
      this.onload = null;
      this.onerror = null;
      this.naturalWidth = 800;
      this.naturalHeight = 600;
      Object.defineProperty(this, 'src', {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(_value: string) {
          setTimeout(() => {
            if (this.onload) {
              this.onload();
            }
          }, 0);
        },
      });
    });

    const regularUrl = 'https://example.com/image.jpg';
    const result = await getImageSizesFromUrl(regularUrl);

    expect(result).toEqual({
      width: 800,
      height: 600,
    });
    // Обычный URL не должен освобождаться
    expect(revokeObjectURLSpy).not.toHaveBeenCalled();
  });

  it('должна выбрасывать ошибку при неудачной загрузке', async () => {
    ImageMock.mockImplementation(function ImageMock(this: ImageMockInstance) {
      this.onload = null;
      this.onerror = null;
      this.naturalWidth = 0;
      this.naturalHeight = 0;
      Object.defineProperty(this, 'src', {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(_value: string) {
          setTimeout(() => {
            if (this.onerror) {
              const errorEvent = new Event('error') as ErrorEvent;
              this.onerror(errorEvent);
            }
          }, 0);
        },
      });
    });

    const blobUrl = 'blob:http://localhost/test';
    await expect(getImageSizesFromUrl(blobUrl)).rejects.toThrow(
      'Failed to load image',
    );
    expect(revokeObjectURLSpy).toHaveBeenCalledWith(blobUrl);
  });
});

describe('resizeImageFromUrl', () => {
  interface ImageMockInstance {
    onload: (() => void) | null;
    onerror: ((error: Event | string) => void) | null;
    naturalWidth: number;
    naturalHeight: number;
  }

  let ImageMock: ReturnType<typeof vi.fn>;
  let createElementSpy: ReturnType<typeof vi.spyOn>;
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;
  let toBlobSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Мокируем Image
    ImageMock = vi.fn(function ImageMock(this: ImageMockInstance) {
      this.onload = null;
      this.onerror = null;
      this.naturalWidth = 1000;
      this.naturalHeight = 800;
      Object.defineProperty(this, 'src', {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(_value: string) {
          setTimeout(() => {
            if (this.onload) {
              this.onload();
            }
          }, 0);
        },
      });
    });

    vi.stubGlobal('Image', ImageMock);

    // Мокируем canvas
    mockContext = {
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext),
      toBlob: vi.fn(),
    } as unknown as HTMLCanvasElement;

    createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(mockCanvas);

    // Мокируем toBlob
    toBlobSpy = vi
      .spyOn(mockCanvas, 'toBlob')
      .mockImplementation((callback: (blob: Blob | null) => void) => {
        const blob = new Blob(['test'], { type: 'image/jpeg' });
        setTimeout(() => callback(blob), 0);
      });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('должна загружать изображение и изменять размер на указанный процент', async () => {
    const url = 'blob:http://localhost/test';
    const percent = 50;

    const result = await resizeImageFromUrl(url, percent);

    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('image/jpeg');
    expect(createElementSpy).toHaveBeenCalledWith('canvas');
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    expect(mockContext.drawImage).toHaveBeenCalled();
    expect(toBlobSpy).toHaveBeenCalled();
  });

  it('должна правильно рассчитывать размеры при изменении на 50%', async () => {
    ImageMock.mockImplementation(function ImageMock(this: ImageMockInstance) {
      this.onload = null;
      this.onerror = null;
      this.naturalWidth = 1000;
      this.naturalHeight = 800;
      Object.defineProperty(this, 'src', {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(_value: string) {
          setTimeout(() => {
            if (this.onload) {
              this.onload();
            }
          }, 0);
        },
      });
    });

    const url = 'blob:http://localhost/test';
    const percent = 50;

    await resizeImageFromUrl(url, percent);

    // Проверяем, что drawImage был вызван с правильными размерами
    expect(mockContext.drawImage).toHaveBeenCalledWith(
      expect.anything(),
      0,
      0,
      500, // 1000 * 50 / 100
      400, // 800 * 50 / 100
    );
  });

  it('должна правильно рассчитывать размеры при увеличении на 150%', async () => {
    ImageMock.mockImplementation(function ImageMock(this: ImageMockInstance) {
      this.onload = null;
      this.onerror = null;
      this.naturalWidth = 800;
      this.naturalHeight = 600;
      Object.defineProperty(this, 'src', {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(_value: string) {
          setTimeout(() => {
            if (this.onload) {
              this.onload();
            }
          }, 0);
        },
      });
    });

    const url = 'blob:http://localhost/test';
    const percent = 150;

    await resizeImageFromUrl(url, percent);

    // Проверяем, что drawImage был вызван с правильными размерами
    expect(mockContext.drawImage).toHaveBeenCalledWith(
      expect.anything(),
      0,
      0,
      1200, // 800 * 150 / 100
      900, // 600 * 150 / 100
    );
  });

  it('должна выбрасывать ошибку при неудачной загрузке изображения', async () => {
    ImageMock.mockImplementation(function ImageMock(this: ImageMockInstance) {
      this.onload = null;
      this.onerror = null;
      this.naturalWidth = 0;
      this.naturalHeight = 0;
      Object.defineProperty(this, 'src', {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(_value: string) {
          setTimeout(() => {
            if (this.onerror) {
              const errorEvent = new Event('error') as ErrorEvent;
              this.onerror(errorEvent);
            }
          }, 0);
        },
      });
    });

    const url = 'blob:http://localhost/test';
    const percent = 50;

    await expect(resizeImageFromUrl(url, percent)).rejects.toThrow(
      'Failed to load image',
    );
  });

  it('должна выбрасывать ошибку если не удалось получить canvas context', async () => {
    mockCanvas.getContext = vi.fn(() => null);

    const url = 'blob:http://localhost/test';
    const percent = 50;

    await expect(resizeImageFromUrl(url, percent)).rejects.toThrow(
      'Failed to get canvas context',
    );
  });

  it('должна выбрасывать ошибку если toBlob вернул null', async () => {
    toBlobSpy.mockImplementation((callback: (blob: Blob | null) => void) => {
      setTimeout(() => callback(null), 0);
    });

    const url = 'blob:http://localhost/test';
    const percent = 50;

    await expect(resizeImageFromUrl(url, percent)).rejects.toThrow(
      'Failed to create blob from canvas',
    );
  });
});
