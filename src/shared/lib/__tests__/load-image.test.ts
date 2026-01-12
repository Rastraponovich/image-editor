import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loadImageFromUrl } from '../load-image';

describe('loadImageFromUrl', () => {
  interface ImageMockInstance {
    onload: (() => void) | null;
    onerror: ((error: Event | string) => void) | null;
    naturalWidth: number;
    naturalHeight: number;
  }

  let ImageMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Создаем мок Image
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

  it('должна успешно загружать изображение', async () => {
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

    const url = 'https://example.com/image.jpg';
    const result = await loadImageFromUrl(url);

    expect(result).toBeInstanceOf(Image);
    expect(result.naturalWidth).toBe(1920);
    expect(result.naturalHeight).toBe(1080);
  });

  it('должна вызывать onRevokeUrl при успешной загрузке', async () => {
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

    const revokeUrlSpy = vi.fn();
    const url = 'blob:http://localhost/test';

    await loadImageFromUrl(url, revokeUrlSpy);

    expect(revokeUrlSpy).toHaveBeenCalledTimes(1);
  });

  it('должна вызывать onRevokeUrl при ошибке загрузки', async () => {
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

    const revokeUrlSpy = vi.fn();
    const url = 'blob:http://localhost/test';

    await expect(loadImageFromUrl(url, revokeUrlSpy)).rejects.toThrow(
      'Failed to load image',
    );

    expect(revokeUrlSpy).toHaveBeenCalledTimes(1);
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

    const url = 'https://example.com/nonexistent.jpg';

    await expect(loadImageFromUrl(url)).rejects.toThrow('Failed to load image');
  });

  it('должна работать без onRevokeUrl колбэка', async () => {
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

    const url = 'https://example.com/image.jpg';
    const result = await loadImageFromUrl(url);

    expect(result).toBeInstanceOf(Image);
    expect(result.naturalWidth).toBe(500);
    expect(result.naturalHeight).toBe(500);
  });

  it('должна устанавливать src изображения', async () => {
    let setSrcValue = '';
    ImageMock.mockImplementation(function ImageMock(this: ImageMockInstance) {
      this.onload = null;
      this.onerror = null;
      this.naturalWidth = 100;
      this.naturalHeight = 100;
      Object.defineProperty(this, 'src', {
        set(value: string) {
          setSrcValue = value;
          setTimeout(() => {
            if (this.onload) {
              this.onload();
            }
          }, 0);
        },
        get() {
          return setSrcValue;
        },
      });
    });

    const url = 'https://example.com/test-image.png';
    await loadImageFromUrl(url);

    expect(setSrcValue).toBe(url);
  });

  it('должна обрабатывать разные типы URL', async () => {
    ImageMock.mockImplementation(function ImageMock(this: ImageMockInstance) {
      this.onload = null;
      this.onerror = null;
      this.naturalWidth = 200;
      this.naturalHeight = 200;
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
    const httpUrl = 'http://example.com/image.jpg';
    const httpsUrl = 'https://example.com/image.jpg';
    const dataUrl =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const blobResult = await loadImageFromUrl(blobUrl);
    expect(blobResult).toBeInstanceOf(Image);

    const httpResult = await loadImageFromUrl(httpUrl);
    expect(httpResult).toBeInstanceOf(Image);

    const httpsResult = await loadImageFromUrl(httpsUrl);
    expect(httpsResult).toBeInstanceOf(Image);

    const dataResult = await loadImageFromUrl(dataUrl);
    expect(dataResult).toBeInstanceOf(Image);
  });
});
