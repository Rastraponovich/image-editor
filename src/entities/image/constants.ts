import { type FilterKey, type Filters, type PointRecord } from './types';

export const DEFAULT_QUALITY = 100;
export const INITIAL_ZOOM = 1;
export const INITIAL_OFFSET: PointRecord = { x: 0, y: 0 };

export const DEFAULT_GRID_ROWS = 3;
export const DEFAULT_GRID_COLS = 3;

export const INITIAL_FILTERS: Filters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  sepia: 0,
  grayscale: 0,
  hue: 0,
};

export const FILTER_KEYS: Record<FilterKey, FilterKey> = {
  brightness: 'brightness',
  contrast: 'contrast',
  saturation: 'saturation',
  blur: 'blur',
  sepia: 'sepia',
  grayscale: 'grayscale',
  hue: 'hue',
};
