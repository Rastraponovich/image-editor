import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Canvas getContext with a stable mock object
const mockContext = {
  canvas: { width: 0, height: 0 },
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  drawImage: vi.fn(),
  set strokeStyle(_val: string) {},
  set lineWidth(_val: number) {},
  set filter(_val: string) {},
};

if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => {
    return mockContext;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;
}
