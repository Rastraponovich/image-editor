import { describe, expect, it } from 'vitest';

import { WHEEL_ZOOM_STEP } from '../constants';
import { calculatePan, calculateZoom } from '../lib';

describe('Viewport Control Math Lib', () => {
  describe('calculatePan', () => {
    it('should correctly calculate new offset', () => {
      const startPoint = { x: 100, y: 100 };
      const currentPoint = { x: 150, y: 120 };
      const startOffset = { x: 10, y: 10 };

      const result = calculatePan(currentPoint, startPoint, startOffset);

      expect(result).toEqual({ x: 60, y: 30 });
    });
  });

  describe('calculateZoom', () => {
    const min = 0.1;
    const max = 5;

    it('should increase zoom', () => {
      expect(calculateZoom(1, 1, min, max)).toBe(1 + WHEEL_ZOOM_STEP);
    });

    it('should decrease zoom', () => {
      expect(calculateZoom(-1, 1, min, max)).toBe(1 - WHEEL_ZOOM_STEP);
    });

    it('should not exceed max zoom', () => {
      expect(calculateZoom(1, 5, min, max)).toBe(5);
    });

    it('should not go below min zoom', () => {
      expect(calculateZoom(-1, 0.1, min, max)).toBe(0.1);
    });
  });
});
