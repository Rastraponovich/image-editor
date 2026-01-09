import { describe, expect, it, vi } from 'vitest';

import {
  calculateFitDimensions,
  calculateGridLines,
  createFilterString,
  drawGrid,
} from '../lib';

describe('Canvas Editor Utilities', () => {
  describe('calculateFitDimensions', () => {
    it('should fit wide image into square container', () => {
      const result = calculateFitDimensions(2000, 1000, 500, 500);
      expect(result).toEqual({ width: 500, height: 250 });
    });

    it('should fit tall image into square container', () => {
      const result = calculateFitDimensions(1000, 2000, 500, 500);
      expect(result).toEqual({ width: 250, height: 500 });
    });
  });

  describe('createFilterString', () => {
    it('should generate default filter string when map is empty', () => {
      const filters = new Map();
      const result = createFilterString(filters);
      expect(result).toContain('brightness(100%)');
      expect(result).toContain('blur(0px)');
    });

    it('should apply values from map', () => {
      const filters = new Map();
      filters.set('brightness', 150);
      filters.set('blur', 5);
      const result = createFilterString(filters);
      expect(result).toContain('brightness(150%)');
      expect(result).toContain('blur(5px)');
    });
  });

  describe('calculateGridLines', () => {
    it('should return correct coordinates for 3x3 grid', () => {
      const { vertical, horizontal } = calculateGridLines(300, 600, 3, 3);
      // 300 / 3 = 100, 200
      expect(vertical).toEqual([100, 200]);
      // 600 / 3 = 200, 400
      expect(horizontal).toEqual([200, 400]);
    });

    it('should return empty arrays for 1x1 grid', () => {
      const { vertical, horizontal } = calculateGridLines(100, 100, 1, 1);
      expect(vertical).toEqual([]);
      expect(horizontal).toEqual([]);
    });
  });

  describe('drawGrid (side effects)', () => {
    it('should call canvas context methods correctly', () => {
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        set strokeStyle(_val: string) {},
        set lineWidth(_val: number) {},
      } as unknown as CanvasRenderingContext2D;

      drawGrid(ctx, 300, 300, { rows: 3, cols: 3 });

      expect(ctx.save).toHaveBeenCalledTimes(1);
      expect(ctx.stroke).toHaveBeenCalledTimes(2); // Shadow pass + Main pass
      expect(ctx.restore).toHaveBeenCalledTimes(1);
    });
  });
});
