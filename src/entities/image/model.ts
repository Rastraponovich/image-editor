import {
  createEffect,
  createEvent,
  createStore,
  restore,
  sample,
} from 'effector';

import { CanvasEditor } from './lib';

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

export const initialFilters: Filters = {
  [FilterKey.hue]: 0,
  [FilterKey.blur]: 0,
  [FilterKey.sepia]: 0,
  [FilterKey.grayscale]: 0,
  [FilterKey.contrast]: 100,
  [FilterKey.saturation]: 100,
  [FilterKey.brightness]: 100,
};

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
  },
  void
>(({ editor, filters, quality }) => {
  editor.setQuality(quality);
  editor.setFilters(filters);
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

export const imageUploadStarted = createEvent<File>();
export const imageUploaded = createEvent<string>();
export const resetFilters = createEvent();

export const imageQualityChanged = createEvent<number>();

export const $canvas = createStore<CanvasEditor>(new CanvasEditor());
export const $filtersRef = createStore({
  ref: new Map<FilterKey, number>(
    Object.entries(initialFilters) as [FilterKey, number][],
  ),
});

export const $imageRaw = restore(imageUploadStarted, null);
export const $image = restore(imageUploaded, null);

export const $imageQuality = restore(imageQualityChanged, 100).reset(
  resetFilters,
);

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
    Object.entries(initialFilters).forEach(([key, value]) => {
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
  clock: [$filtersRef, $imageQuality],
  source: { canvas: $canvas, filters: $filtersRef, quality: $imageQuality },
  fn: ({ canvas, filters, quality }) => ({
    editor: canvas,
    filters: filters.ref,
    quality,
  }),
  target: applyFiltersFx,
});
