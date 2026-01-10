import { type PointRecord, WHEEL_ZOOM_STEP } from './constants';

/**
 * Расчитывает новое смещение на основе разницы координат мыши
 */
export function calculatePan(
  currentPoint: PointRecord,
  startPoint: PointRecord,
  startOffset: PointRecord,
): PointRecord {
  return {
    x: startOffset.x + (currentPoint.x - startPoint.x),
    y: startOffset.y + (currentPoint.y - startPoint.y),
  };
}

/**
 * Расчитывает новый масштаб с учетом границ
 */
export function calculateZoom(
  delta: number,
  currentZoom: number,
  minZoom: number,
  maxZoom: number,
): number {
  const direction = delta > 0 ? 1 : -1;
  return Math.min(
    Math.max(currentZoom + direction * WHEEL_ZOOM_STEP, minZoom),
    maxZoom,
  );
}
