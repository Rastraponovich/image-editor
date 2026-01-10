import {
  createEffect,
  createEvent,
  createStore,
  restore,
  sample,
} from 'effector';

import {
  DEFAULT_QUALITY,
  INITIAL_FILTERS,
  INITIAL_OFFSET,
  INITIAL_ZOOM,
} from './constants';
import { calculateFitDimensions, createFilterString, drawGrid } from './lib';
import { FilterKey, type Filters, type PointRecord } from './types';

/**
 * Класс управления редактором изображений на базе Canvas.
 * Обеспечивает монтирование к DOM, управление размерами и рендеринг.
 */
export class CanvasEditor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private img: HTMLImageElement | null = null;
  private container: HTMLElement | null = null;
  private viewport: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private filters: Map<FilterKey, number> = new Map();
  private quality: number = DEFAULT_QUALITY;
  private isGridVisible: boolean = false;
  private zoom: number = INITIAL_ZOOM;
  private offset: PointRecord = INITIAL_OFFSET;

  /**
   * Конструктор редактора.
   * @param canvas - Опциональный элемент холста (если не передан, создастся автоматически)
   */
  constructor(canvas?: HTMLCanvasElement) {
    this.canvas = canvas || document.createElement('canvas');
    this.initializeContext();
  }

  /**
   * Инициализация 2D контекста с настройками рендеринга.
   */
  private initializeContext() {
    // imageRendering = pixelated позволяет видеть артефакты при низком качестве (quality)
    this.canvas.style.imageRendering = 'pixelated';
    this.ctx = this.canvas.getContext('2d');

    // Если контекст не получен (например, в тестах без заглушек),
    // мы не выбрасываем ошибку сразу, а проверяем его при отрисовке.
  }

  /**
   * Вычисляет доступный размер контейнера с учетом вьюпорта и паддингов.
   * @returns Объект с шириной и высотой
   */
  public getContainerSize() {
    const target = this.viewport || this.container;
    if (!target) {
      return { width: 0, height: 0 };
    }

    const style = window.getComputedStyle(target);
    const paddingX =
      parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const paddingY =
      parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);

    return {
      width: Math.max(0, target.clientWidth - paddingX),
      height: Math.max(0, target.clientHeight - paddingY),
    };
  }

  /**
   * Подгоняет размеры холста под размеры вьюпорта, сохраняя пропорции изображения.
   */
  public fitToContainer() {
    if (!this.img || !this.container) {
      return;
    }

    const { width: containerWidth, height: containerHeight } =
      this.getContainerSize();

    if (containerWidth === 0 || containerHeight === 0) {
      return;
    }

    const { width, height } = calculateFitDimensions(
      this.img.naturalWidth,
      this.img.naturalHeight,
      containerWidth,
      containerHeight,
    );

    this.setDimensions(width, height);
  }

  /**
   * Инициализирует редактор, привязывая его к DOM-элементам.
   * @param container - Элемент, куда будет вставлен canvas (ArtBoard)
   * @param viewport - Элемент, по которому считаются размеры (Stage)
   */
  public mount(container: HTMLElement, viewport?: HTMLElement) {
    if (this.container === container) return;

    this.container = container;
    this.viewport = viewport || container;
    container.appendChild(this.canvas);

    // Подписываемся на изменение размеров вьюпорта
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.fitToContainer();
      });
      this.resizeObserver.observe(this.viewport);
    }

    this.fitToContainer();
  }

  /**
   * Удаляет обработчики и очищает ссылки при демонтаже компонента.
   */
  public unmount() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.canvas.remove();
    this.container = null;
    this.viewport = null;
  }

  /**
   * Загружает изображение по URL.
   * @param url - Ссылка на изображение
   */
  public async loadImage(url: string): Promise<boolean> {
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

  /**
   * Обновляет активные фильтры.
   * @param filters - Map с параметрами фильтров
   */
  public setFilters(filters: Map<FilterKey, number>) {
    this.filters = filters;
    this.render();
  }

  /**
   * Устанавливает качество (влияет на физическое разрешение холста).
   * @param quality - Число от 1 до 100
   */
  public setQuality(quality: number) {
    this.quality = quality;
    this.fitToContainer();
  }

  /**
   * Переключает видимость сетки.
   * @param visible - Флаг видимости
   */
  public setGridVisible(visible: boolean) {
    this.isGridVisible = visible;
    this.render();
  }

  /**
   * Устанавливает масштаб.
   * @param zoom - Коэффициент масштабирования
   */
  public setZoom(zoom: number) {
    this.zoom = zoom;
    this.updateTransform();
  }

  /**
   * Устанавливает смещение.
   * @param offset - Объект со смещением x и y
   */
  public setOffset(offset: { x: number; y: number }) {
    this.offset = offset;
    this.updateTransform();
  }

  /**
   * Возвращает текущий зум.
   */
  public getZoom() {
    return this.zoom;
  }

  /**
   * Возвращает текущее смещение.
   */
  public getOffset() {
    return this.offset;
  }

  /**
   * Обновляет CSS-трансформацию холста.
   */
  private updateTransform() {
    // В профессиональной модели мы не трансформируем сам элемент canvas через CSS,
    // чтобы сетка и границы оставались четкими. Мы будем использовать внутренние координаты в render().
    this.render();
  }

  /**
   * Устанавливает визуальные (CSS) и физические размеры холста.
   * @param width - Визуальная ширина
   * @param height - Визуальная высота
   */
  public setDimensions(width: number, height: number) {
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    // Реальное количество пикселей холста зависит от параметра качества.
    // Это создает эффект пикселизации при низком качестве и экономит ресурсы.
    this.canvas.width = width * (this.quality / 100);
    this.canvas.height = height * (this.quality / 100);

    this.updateTransform();
    this.render();
  }

  /**
   * Приватный метод отрисовки на заданном контексте.
   * Содержит общую логику отрисовки для render() и toDataURL().
   * @param ctx - Контекст для отрисовки
   * @param width - Ширина области отрисовки
   * @param height - Высота области отрисовки
   * @param includeGrid - Включать ли сетку в отрисовку
   */
  private draw(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    includeGrid: boolean,
  ) {
    if (!this.img) {
      return;
    }

    // 1. Рисуем белую подложку (холст)
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 2. Рисуем изображение с учетом трансформаций (зум и пан внутри кадра)
    ctx.filter = createFilterString(this.filters);

    // Вычисляем размеры отрисовки
    const drawWidth = width * this.zoom;
    const drawHeight = height * this.zoom;

    // Центрируем и добавляем офсет
    const x = (width - drawWidth) / 2 + this.offset.x;
    const y = (height - drawHeight) / 2 + this.offset.y;

    ctx.drawImage(this.img, x, y, drawWidth, drawHeight);
    ctx.filter = 'none';
    ctx.restore();

    // 3. Сетка рисуется ПОВЕРХ всего, но она привязана к границам подложки (кадра)
    if (includeGrid) {
      drawGrid(ctx, width, height);
    }
  }

  /**
   * Основной метод отрисовки. Вызывает применение фильтров и отрисовку сетки.
   */
  public render() {
    if (!this.img || !this.ctx) {
      return;
    }

    const { width, height } = this.canvas;
    this.draw(this.ctx, width, height, this.isGridVisible);
  }

  /**
   * Возвращает HTML-элемент холста.
   */
  public getCanvas() {
    return this.canvas;
  }

  /**
   * Экспортирует текущий кадр (viewport) в dataURL.
   * Сохраняет именно то, что видит пользователь: кадр с учетом зума, пана и фильтров.
   * @param type - MIME тип (image/jpeg, image/png)
   * @param quality - Качество сжатия (0..1)
   */
  public toDataURL(type = 'image/jpeg', quality = 1): string {
    if (!this.img || !this.ctx) {
      return '';
    }

    // Используем размеры текущего кадра (viewport), а не оригинального изображения
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Создаем временный холст с размерами кадра
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) {
      return '';
    }

    // Отрисовываем текущий кадр БЕЗ сетки (сетка - это только UI-направляющая)
    this.draw(tempCtx, width, height, false);

    return tempCanvas.toDataURL(type, quality);
  }
}

// Эффект для инициализации (привязки к DOM)
export const mountCanvasFx = createEffect<
  {
    container: HTMLElement;
    viewport: HTMLElement;
    editor: CanvasEditor;
  },
  void
>(({ container, viewport, editor }) => {
  editor.mount(container, viewport);
});

// Эффект для удаления холста
export const unmountCanvasFx = createEffect<CanvasEditor, void>(editor => {
  editor.unmount();
});

// Эффект для обновления картинки
const updateCanvasImageFx = createEffect<
  { editor: CanvasEditor; src: string },
  void
>(async ({ editor, src }) => {
  await editor.loadImage(src);
});

// Эффект для применения фильтров
export const applyFiltersFx = createEffect<
  {
    editor: CanvasEditor;
    filters: Map<FilterKey, number>;
    quality: number;
    isGridVisible: boolean;
  },
  void
>(({ editor, filters, quality, isGridVisible }) => {
  editor.setQuality(quality);
  editor.setGridVisible(isGridVisible);
  editor.setFilters(filters);
});

export const applyTransformFx = createEffect<
  {
    editor: CanvasEditor;
    zoom: number;
    offset: { x: number; y: number };
  },
  void
>(({ editor, zoom, offset }) => {
  editor.setZoom(zoom);
  editor.setOffset(offset);
});

export const filtersChanged = createEvent<{
  id: FilterKey;
  value: Filters[FilterKey];
}>();

const imageUploadFx = createEffect(async (file: File) => {
  return URL.createObjectURL(file);
});

// Events
export const mountCanvas = createEvent<{
  editor: CanvasEditor;
  container: HTMLElement;
  viewport: HTMLElement;
}>();

export const unmountCanvas = createEvent();

export const imageUploadStarted = createEvent<File>();
export const imageUploaded = createEvent<string>();
export const resetFilters = createEvent();

export const imageQualityChanged = createEvent<number>();
export const gridToggled = createEvent<boolean>();

export const $canvas = createStore<CanvasEditor>(new CanvasEditor());
export const $filtersRef = createStore({
  ref: new Map<FilterKey, number>(
    Object.entries(INITIAL_FILTERS) as [FilterKey, number][],
  ),
});

export const $imageRaw = restore(imageUploadStarted, null);
export const $image = restore(imageUploaded, null);

export const $imageQuality = restore(
  imageQualityChanged,
  DEFAULT_QUALITY,
).reset(resetFilters);

export const $isGridVisible = restore(gridToggled, false);

const $counter = createStore(0).on($filtersRef, counter => counter + 1);

export const $hasChanges = $counter.map(counter => counter > 0);

sample({
  clock: filtersChanged,
  source: $filtersRef,
  filter: ({ ref }, payload) => ref.has(payload.id),
  fn: ({ ref }, payload) => {
    ref.set(payload.id, payload.value);

    return { ref };
  },
  target: $filtersRef,
});

sample({
  clock: resetFilters,
  source: $filtersRef,

  fn: ({ ref }) => {
    ref.clear();
    Object.entries(INITIAL_FILTERS).forEach(([key, value]) => {
      ref.set(key as FilterKey, value);
    });
    return { ref };
  },
  target: $filtersRef,
});

sample({
  clock: resetFilters,
  target: $counter.reinit,
});

sample({
  clock: mountCanvas,
  target: mountCanvasFx,
});

sample({
  clock: unmountCanvas,
  source: $canvas,
  target: unmountCanvasFx,
});

sample({ clock: imageUploadStarted, target: imageUploadFx });

sample({
  clock: imageUploadFx.doneData,
  target: [imageUploaded, resetFilters],
});

sample({
  clock: imageUploaded,
  source: $canvas,
  fn: (editor, src) => ({ editor, src }),
  target: updateCanvasImageFx,
});

sample({
  clock: [$filtersRef, $imageQuality, $isGridVisible],
  source: {
    canvas: $canvas,
    filters: $filtersRef,
    quality: $imageQuality,
    isGridVisible: $isGridVisible,
  },
  fn: ({ canvas, filters, quality, isGridVisible }) => ({
    editor: canvas,
    filters: filters.ref,
    quality,
    isGridVisible,
  }),
  target: applyFiltersFx,
});
