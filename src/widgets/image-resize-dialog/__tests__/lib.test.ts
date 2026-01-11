import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  calculateProportionalDimension,
  getImageSizesFromBlob,
  getImageSizesFromUrl,
  prepareResizeParams,
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

    const result = await resizeImageFromUrl({
      mode: 'percent',
      imageUrl: url,
      percent,
    });

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

    await resizeImageFromUrl({
      mode: 'percent',
      imageUrl: url,
      percent,
    });

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

    await resizeImageFromUrl({
      mode: 'percent',
      imageUrl: url,
      percent,
    });

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

    await expect(
      resizeImageFromUrl({
        mode: 'percent',
        imageUrl: url,
        percent,
      }),
    ).rejects.toThrow('Failed to load image');
  });

  it('должна выбрасывать ошибку если не удалось получить canvas context', async () => {
    mockCanvas.getContext = vi.fn(() => null);

    const url = 'blob:http://localhost/test';
    const percent = 50;

    await expect(
      resizeImageFromUrl({
        mode: 'percent',
        imageUrl: url,
        percent,
      }),
    ).rejects.toThrow('Failed to get canvas context');
  });

  it('должна выбрасывать ошибку если toBlob вернул null', async () => {
    toBlobSpy.mockImplementation((callback: (blob: Blob | null) => void) => {
      setTimeout(() => callback(null), 0);
    });

    const url = 'blob:http://localhost/test';
    const percent = 50;

    await expect(
      resizeImageFromUrl({
        mode: 'percent',
        imageUrl: url,
        percent,
      }),
    ).rejects.toThrow('Failed to create blob from canvas');
  });
});

describe('calculateProportionalDimension', () => {
  describe('изменение ширины (вычисление высоты)', () => {
    it('должна вычислять высоту при изменении ширины для landscape изображения', () => {
      const originalWidth = 1920;
      const originalHeight = 1080;
      const newWidth = 960;

      const result = calculateProportionalDimension(
        originalWidth,
        originalHeight,
        newWidth,
        'width',
      );

      // 960 / (1920 / 1080) = 960 / 1.777... = 540
      expect(result).toBe(540);
    });

    it('должна вычислять высоту при изменении ширины для portrait изображения', () => {
      const originalWidth = 800;
      const originalHeight = 1200;
      const newWidth = 400;

      const result = calculateProportionalDimension(
        originalWidth,
        originalHeight,
        newWidth,
        'width',
      );

      // 400 / (800 / 1200) = 400 / 0.666... = 600
      expect(result).toBe(600);
    });

    it('должна вычислять высоту для квадратного изображения', () => {
      const originalWidth = 1000;
      const originalHeight = 1000;
      const newWidth = 500;

      const result = calculateProportionalDimension(
        originalWidth,
        originalHeight,
        newWidth,
        'width',
      );

      // 500 / (1000 / 1000) = 500 / 1 = 500
      expect(result).toBe(500);
    });

    it('должна округлять результат до целого числа', () => {
      const originalWidth = 1000;
      const originalHeight = 750;
      const newWidth = 333;

      const result = calculateProportionalDimension(
        originalWidth,
        originalHeight,
        newWidth,
        'width',
      );

      // 333 / (1000 / 750) = 333 / 1.333... = 249.75 -> 250
      expect(result).toBe(250);
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe('изменение высоты (вычисление ширины)', () => {
    it('должна вычислять ширину при изменении высоты для landscape изображения', () => {
      const originalWidth = 1920;
      const originalHeight = 1080;
      const newHeight = 540;

      const result = calculateProportionalDimension(
        originalWidth,
        originalHeight,
        newHeight,
        'height',
      );

      // 540 * (1920 / 1080) = 540 * 1.777... = 960
      expect(result).toBe(960);
    });

    it('должна вычислять ширину при изменении высоты для portrait изображения', () => {
      const originalWidth = 800;
      const originalHeight = 1200;
      const newHeight = 600;

      const result = calculateProportionalDimension(
        originalWidth,
        originalHeight,
        newHeight,
        'height',
      );

      // 600 * (800 / 1200) = 600 * 0.666... = 400
      expect(result).toBe(400);
    });

    it('должна вычислять ширину для квадратного изображения', () => {
      const originalWidth = 1000;
      const originalHeight = 1000;
      const newHeight = 500;

      const result = calculateProportionalDimension(
        originalWidth,
        originalHeight,
        newHeight,
        'height',
      );

      // 500 * (1000 / 1000) = 500 * 1 = 500
      expect(result).toBe(500);
    });

    it('должна округлять результат до целого числа', () => {
      const originalWidth = 1000;
      const originalHeight = 750;
      const newHeight = 250;

      const result = calculateProportionalDimension(
        originalWidth,
        originalHeight,
        newHeight,
        'height',
      );

      // 250 * (1000 / 750) = 250 * 1.333... = 333.33... -> 333
      expect(result).toBe(333);
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe('граничные случаи', () => {
    it('должна возвращать changedValue если originalWidth равен 0', () => {
      const originalWidth = 0;
      const originalHeight = 1080;
      const changedValue = 500;

      const resultWidth = calculateProportionalDimension(
        originalWidth,
        originalHeight,
        changedValue,
        'width',
      );
      const resultHeight = calculateProportionalDimension(
        originalWidth,
        originalHeight,
        changedValue,
        'height',
      );

      expect(resultWidth).toBe(changedValue);
      expect(resultHeight).toBe(changedValue);
    });

    it('должна возвращать changedValue если originalHeight равен 0', () => {
      const originalWidth = 1920;
      const originalHeight = 0;
      const changedValue = 500;

      const resultWidth = calculateProportionalDimension(
        originalWidth,
        originalHeight,
        changedValue,
        'width',
      );
      const resultHeight = calculateProportionalDimension(
        originalWidth,
        originalHeight,
        changedValue,
        'height',
      );

      expect(resultWidth).toBe(changedValue);
      expect(resultHeight).toBe(changedValue);
    });

    it('должна возвращать changedValue если оба размера равны 0', () => {
      const originalWidth = 0;
      const originalHeight = 0;
      const changedValue = 500;

      const resultWidth = calculateProportionalDimension(
        originalWidth,
        originalHeight,
        changedValue,
        'width',
      );
      const resultHeight = calculateProportionalDimension(
        originalWidth,
        originalHeight,
        changedValue,
        'height',
      );

      expect(resultWidth).toBe(changedValue);
      expect(resultHeight).toBe(changedValue);
    });
  });

  describe('различные пропорции', () => {
    it('должна корректно работать с очень широким изображением (16:9)', () => {
      const originalWidth = 3840;
      const originalHeight = 2160;
      const newWidth = 1920;

      const result = calculateProportionalDimension(
        originalWidth,
        originalHeight,
        newWidth,
        'width',
      );

      // 1920 / (3840 / 2160) = 1920 / 1.777... = 1080
      expect(result).toBe(1080);
    });

    it('должна корректно работать с очень высоким изображением (9:16)', () => {
      const originalWidth = 1080;
      const originalHeight = 1920;
      const newHeight = 960;

      const result = calculateProportionalDimension(
        originalWidth,
        originalHeight,
        newHeight,
        'height',
      );

      // 960 * (1080 / 1920) = 960 * 0.5625 = 540
      expect(result).toBe(540);
    });

    it('должна корректно работать с небольшими значениями', () => {
      const originalWidth = 100;
      const originalHeight = 75;
      const newWidth = 50;

      const result = calculateProportionalDimension(
        originalWidth,
        originalHeight,
        newWidth,
        'width',
      );

      // 50 / (100 / 75) = 50 / 1.333... = 37.5 -> 38
      expect(result).toBe(38);
    });

    it('должна корректно работать с большими значениями', () => {
      const originalWidth = 10000;
      const originalHeight = 5000;
      const newWidth = 5000;

      const result = calculateProportionalDimension(
        originalWidth,
        originalHeight,
        newWidth,
        'width',
      );

      // 5000 / (10000 / 5000) = 5000 / 2 = 2500
      expect(result).toBe(2500);
    });
  });
});

describe('prepareResizeParams', () => {
  it('должна возвращать параметры для режима процентов', () => {
    const imageUrl = 'blob:http://localhost/test';
    const mode = 'percent';
    const percent = 150;
    const width = 1920;
    const height = 1080;

    const result = prepareResizeParams(imageUrl, mode, percent, width, height);

    expect(result).toEqual({
      mode: 'percent',
      imageUrl,
      percent,
    });
  });

  it('должна возвращать параметры для режима размеров', () => {
    const imageUrl = 'blob:http://localhost/test';
    const mode = 'dimensions';
    const percent = 100;
    const width = 1920;
    const height = 1080;

    const result = prepareResizeParams(imageUrl, mode, percent, width, height);

    expect(result).toEqual({
      mode: 'dimensions',
      imageUrl,
      width,
      height,
    });
  });

  it('должна игнорировать percent и width/height в зависимости от режима', () => {
    const imageUrl = 'https://example.com/image.jpg';
    const percent = 50;
    const width = 800;
    const height = 600;

    const percentResult = prepareResizeParams(
      imageUrl,
      'percent',
      percent,
      width,
      height,
    );
    const dimensionsResult = prepareResizeParams(
      imageUrl,
      'dimensions',
      percent,
      width,
      height,
    );

    expect(percentResult).toEqual({
      mode: 'percent',
      imageUrl,
      percent: 50,
    });
    expect(percentResult).not.toHaveProperty('width');
    expect(percentResult).not.toHaveProperty('height');

    expect(dimensionsResult).toEqual({
      mode: 'dimensions',
      imageUrl,
      width: 800,
      height: 600,
    });
    expect(dimensionsResult).not.toHaveProperty('percent');
  });

  it('должна корректно работать с различными URL', () => {
    const blobUrl = 'blob:http://localhost/test';
    const httpUrl = 'https://example.com/image.jpg';
    const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';

    const blobResult = prepareResizeParams(blobUrl, 'percent', 100, 0, 0);
    const httpResult = prepareResizeParams(
      httpUrl,
      'dimensions',
      0,
      1920,
      1080,
    );
    const dataResult = prepareResizeParams(dataUrl, 'percent', 75, 0, 0);

    expect(blobResult.imageUrl).toBe(blobUrl);
    expect(httpResult.imageUrl).toBe(httpUrl);
    expect(dataResult.imageUrl).toBe(dataUrl);
  });
});
