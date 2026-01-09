import { createEvent, createStore, restore, sample } from 'effector';

import { $canvas, applyTransformFx, imageUploaded } from '~/entities/image';

import {
  BUTTON_ZOOM_STEP,
  DEFAULT_ZOOM,
  INITIAL_POINT,
  MAX_ZOOM,
  MIN_ZOOM,
} from './constants';
import { calculatePan, calculateZoom } from './lib';

// Events
export const zoomChanged = createEvent<number>();
export const offsetChanged = createEvent<{ x: number; y: number }>();
export const resetTransform = createEvent();

// Buttons events (for UI)
export const zoomInClicked = createEvent();
export const zoomOutClicked = createEvent();
export const resetZoomClicked = createEvent();

// Interaction Events (Data only)
export const interactionStarted = createEvent<{
  x: number;
  y: number;
  startOffset: { x: number; y: number };
}>();
export const interactionMoved = createEvent<{ x: number; y: number }>();
export const interactionFinished = createEvent();
export const wheelScrolled = createEvent<{ delta: number }>();

// Stores
export const $zoom = restore(zoomChanged, DEFAULT_ZOOM).reset(resetTransform);
export const $offset = restore(offsetChanged, INITIAL_POINT).reset(
  resetTransform,
);

// Stores for interaction state
export const $isDragging = createStore(false)
  .on(interactionStarted, () => true)
  .reset(interactionFinished);

const $dragStartPoint = createStore(INITIAL_POINT).on(
  interactionStarted,
  (_, { x, y }) => ({ x, y }),
);

const $dragStartOffset = createStore(INITIAL_POINT).on(
  interactionStarted,
  (_, { startOffset }) => startOffset,
);

// Logic

// Расчет смещения при перемещении мыши
sample({
  clock: interactionMoved,
  source: {
    isDragging: $isDragging,
    startPoint: $dragStartPoint,
    startOffset: $dragStartOffset,
  },
  filter: ({ isDragging }) => isDragging,
  fn: ({ startPoint, startOffset }, currentPoint) =>
    calculatePan(currentPoint, startPoint, startOffset),
  target: offsetChanged,
});

// Масштабирование колесиком мыши
sample({
  clock: wheelScrolled,
  source: $zoom,
  fn: (currentZoom, { delta }) =>
    calculateZoom(delta, currentZoom, MIN_ZOOM, MAX_ZOOM),
  target: zoomChanged,
});

// Сброс трансформаций при загрузке нового изображения
sample({
  clock: imageUploaded,
  target: [$zoom.reinit, $offset.reinit],
});

// Увеличение масштаба кнопкой
sample({
  clock: zoomInClicked,
  source: $zoom,
  fn: zoom => Math.min(zoom + BUTTON_ZOOM_STEP, MAX_ZOOM),
  target: zoomChanged,
});

// Уменьшение масштаба кнопкой
sample({
  clock: zoomOutClicked,
  source: $zoom,
  fn: zoom => Math.max(zoom - BUTTON_ZOOM_STEP, MIN_ZOOM),
  target: zoomChanged,
});

// Сброс масштаба кнопкой "100%"
sample({
  clock: resetZoomClicked,
  target: resetTransform,
});

// Синхронизация сторов с инстансом редактора (CanvasEditor)
sample({
  clock: [$zoom, $offset],
  source: { editor: $canvas, zoom: $zoom, offset: $offset },
  target: applyTransformFx,
});
