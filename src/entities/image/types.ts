export const FilterKey = {
  brightness: 'brightness',
  contrast: 'contrast',
  saturation: 'saturation',
  blur: 'blur',
  sepia: 'sepia',
  grayscale: 'grayscale',
  hue: 'hue',
} as const;

export type FilterKey = keyof typeof FilterKey;

export type Filters = {
  hue: number;
  blur: number;
  sepia: number;
  contrast: number;
  grayscale: number;
  brightness: number;
  saturation: number;
};

export type PointRecord = { x: number; y: number };
