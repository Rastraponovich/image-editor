import { DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS } from './constants';
import type { FilterKey } from './types';

/**
 * Опции для настройки отображения сетки
 */
export interface GridOptions {
  rows?: number;
  cols?: number;
  strokeStyleMain?: string;
  strokeStyleShadow?: string;
  lineWidthMain?: number;
  lineWidthShadow?: number;
}

/**
 * Генерирует строку CSS-фильтров на основе карты параметров.
 * @param filters - Карта фильтров (яркость, контраст и т.д.)
 * @returns Валидная строка для свойства ctx.filter
 */
export function createFilterString(filters: Map<FilterKey, number>): string {
  const f = {
    brightness: filters.get('brightness') ?? 100,
    contrast: filters.get('contrast') ?? 100,
    saturation: filters.get('saturation') ?? 100,
    blur: filters.get('blur') ?? 0,
    sepia: filters.get('sepia') ?? 0,
    grayscale: filters.get('grayscale') ?? 0,
    hue: filters.get('hue') ?? 0,
  };

  return [
    `brightness(${f.brightness}%)`,
    `contrast(${f.contrast}%)`,
    `saturate(${f.saturation}%)`,
    `blur(${f.blur}px)`,
    `sepia(${f.sepia}%)`,
    `grayscale(${f.grayscale}%)`,
    `hue-rotate(${f.hue}deg)`,
  ].join(' ');
}

/**
 * Вычисляет координаты линий для сетки.
 * @param width - Ширина холста
 * @param height - Высота холста
 * @param rows - Количество строк
 * @param cols - Количество колонок
 * @returns Списки координат X для вертикальных и Y для горизонтальных линий
 */
export function calculateGridLines(
  width: number,
  height: number,
  rows: number,
  cols: number,
) {
  const vertical = [];
  const horizontal = [];

  for (let i = 1; i < cols; i++) {
    vertical.push((width / cols) * i);
  }
  for (let i = 1; i < rows; i++) {
    horizontal.push((height / rows) * i);
  }

  return { vertical, horizontal };
}

/**
 * Вычисляет размеры для вписывания изображения в контейнер (object-fit: contain).
 * @param imgWidth - Исходная ширина изображения
 * @param imgHeight - Исходная высота изображения
 * @param containerWidth - Ширина доступной области
 * @param containerHeight - Высота доступной области
 * @returns Результирующие размеры width и height
 */
export function calculateFitDimensions(
  imgWidth: number,
  imgHeight: number,
  containerWidth: number,
  containerHeight: number,
) {
  const imgAspectRatio = imgWidth / imgHeight;
  const containerAspectRatio = containerWidth / containerHeight;

  if (imgAspectRatio > containerAspectRatio) {
    return {
      width: containerWidth,
      height: containerWidth / imgAspectRatio,
    };
  }

  return {
    width: containerHeight * imgAspectRatio,
    height: containerHeight,
  };
}

/**
 * Отрисовывает изображение с применением фильтров на холсте.
 * @param ctx - Контекст рисования 2D
 * @param image - Элемент изображения
 * @param filters - Карта активных фильтров
 * @param canvasWidth - Ширина области отрисовки
 * @param canvasHeight - Высота области отрисовки
 */
export function applyFiltersToContext(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  filters: Map<FilterKey, number>,
  canvasWidth: number,
  canvasHeight: number,
) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.filter = createFilterString(filters);
  ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);
  // Сбрасываем фильтр, чтобы он не влиял на последующие отрисовки (например, сетку)
  ctx.filter = 'none';
}

/**
 * Отрисовывает сетку 3x3 (или другую) поверх изображения.
 * Использует двойной проход для обеспечения видимости на любом фоне.
 * @param ctx - Контекст рисования 2D
 * @param width - Ширина холста
 * @param height - Высота холста
 * @param options - Настройки сетки
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: GridOptions = {},
) {
  const {
    rows = DEFAULT_GRID_ROWS,
    cols = DEFAULT_GRID_COLS,
    strokeStyleMain = 'rgba(255, 255, 255, 0.9)',
    strokeStyleShadow = 'rgba(0, 0, 0, 0.5)',
    lineWidthMain = 1,
    lineWidthShadow = 3,
  } = options;

  const { vertical, horizontal } = calculateGridLines(
    width,
    height,
    rows,
    cols,
  );

  ctx.save();

  const drawPass = (style: string, lineWidth: number) => {
    ctx.strokeStyle = style;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();

    vertical.forEach(x => {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    });

    horizontal.forEach(y => {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    });

    ctx.stroke();
  };

  // 1. Рисуем темную обводку (тень)
  drawPass(strokeStyleShadow, lineWidthShadow);
  // 2. Рисуем основную светлую линию
  drawPass(strokeStyleMain, lineWidthMain);

  ctx.restore();
}
