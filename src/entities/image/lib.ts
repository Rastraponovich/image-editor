import type { FilterKey } from './model';

export const applyFiltersToContext = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  filters: Map<FilterKey, number>,
  canvasWidth: number,
  canvasHeight: number,
) => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Значения по умолчанию для каждого фильтра
  const f = {
    brightness: filters.get('brightness') ?? 100,
    contrast: filters.get('contrast') ?? 100,
    saturation: filters.get('saturation') ?? 100,
    blur: filters.get('blur') ?? 0,
    sepia: filters.get('sepia') ?? 0,
    grayscale: filters.get('grayscale') ?? 0,
    hue: filters.get('hue') ?? 0,
  };

  const filterString = [
    `brightness(${f.brightness}%)`,
    `contrast(${f.contrast}%)`,
    `saturate(${f.saturation}%)`,
    `blur(${f.blur}px)`,
    `sepia(${f.sepia}%)`,
    `grayscale(${f.grayscale}%)`,
    `hue-rotate(${f.hue}deg)`,
  ].join(' ');

  ctx.filter = filterString;

  // Draw image
  ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);
};

export class CanvasEditor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private img: HTMLImageElement | null = null;
  private container: HTMLElement | null = null;
  private viewport: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private filters: Map<FilterKey, number> = new Map();
  private quality: number = 100;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.imageRendering = 'pixelated';
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get canvas context');
    }
    this.ctx = context;
  }

  getContainerSize() {
    const target = this.viewport || this.container;
    if (!target) {
      return { width: 0, height: 0 };
    }

    // Получаем вычисленные стили, чтобы вычесть паддинги
    const style = window.getComputedStyle(target);
    const paddingX =
      parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const paddingY =
      parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);

    return {
      width: target.clientWidth - paddingX,
      height: target.clientHeight - paddingY,
    };
  }

  // Метод для автоматического расчета размеров с сохранением пропорций
  fitToContainer() {
    if (!this.img || !this.container) {
      return;
    }

    const { width: containerWidth, height: containerHeight } =
      this.getContainerSize();
    if (containerWidth === 0 || containerHeight === 0) {
      return;
    }

    const imgWidth = this.img.naturalWidth;
    const imgHeight = this.img.naturalHeight;
    const imgAspectRatio = imgWidth / imgHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    let canvasWidth, canvasHeight;

    if (imgAspectRatio > containerAspectRatio) {
      // Изображение шире относительно контейнера
      canvasWidth = containerWidth;
      canvasHeight = containerWidth / imgAspectRatio;
    } else {
      // Изображение выше относительно контейнера
      canvasHeight = containerHeight;
      canvasWidth = containerHeight * imgAspectRatio;
    }

    this.setDimensions(canvasWidth, canvasHeight);
  }

  // Метод для привязки к React-рефу
  mount(container: HTMLElement, viewport?: HTMLElement) {
    if (this.container === container) return;

    this.container = container;
    this.viewport = viewport || container;
    container.appendChild(this.canvas);

    this.resizeObserver = new ResizeObserver(() => {
      this.fitToContainer();
    });

    this.resizeObserver.observe(this.viewport);
    this.fitToContainer();
  }

  unmount() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.canvas.remove();
    this.container = null;
  }

  // Методы манипуляции
  async loadImage(url: string) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        this.img = img;
        this.fitToContainer();
        resolve(true);
      };
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };
    });
  }

  setFilters(filters: Map<FilterKey, number>) {
    this.filters = filters;
    this.render();
  }

  setQuality(quality: number) {
    this.quality = quality;
    this.fitToContainer();
  }

  setDimensions(width: number, height: number) {
    // CSS-размеры (как холст выглядит на экране)
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    // Внутренние размеры (реальное разрешение)
    this.canvas.width = width * (this.quality / 100);
    this.canvas.height = height * (this.quality / 100);

    this.render();
  }

  render() {
    if (!this.img) {
      return;
    }

    applyFiltersToContext(
      this.ctx,
      this.img,
      this.filters,
      this.canvas.width,
      this.canvas.height,
    );
  }

  getCanvas() {
    return this.canvas;
  }

  // Получить данные изображения с сохранением оригинальных размеров
  toDataURL(type = 'image/jpeg', quality = 1) {
    if (!this.img) return '';

    // Всегда используем оригинальные размеры изображения
    const width = this.img.naturalWidth;
    const height = this.img.naturalHeight;

    // Создаем временный канвас в полном разрешении
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) return '';

    // Применяем фильтры и рисуем в полном разрешении
    applyFiltersToContext(
      tempCtx,
      this.img,
      this.filters,
      tempCanvas.width,
      tempCanvas.height,
    );

    // Возвращаем dataURL. Параметр quality здесь влияет только на компрессию JPEG/WebP.
    return tempCanvas.toDataURL(type, quality);
  }
}
