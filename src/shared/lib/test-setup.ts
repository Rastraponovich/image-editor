import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Canvas getContext
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => {
    return {
      canvas: { width: 0, height: 0 },
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      set strokeStyle(_val: string) {},
      set lineWidth(_val: number) {},
      set filter(_val: string) {},
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;
}
