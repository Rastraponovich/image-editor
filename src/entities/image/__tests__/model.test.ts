import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CanvasEditor } from '../model';
import type { FilterKey } from '../types';

describe('CanvasEditor', () => {
  let editor: CanvasEditor;
  let container: HTMLElement;
  let viewport: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    editor = new CanvasEditor();
    container = document.createElement('div');
    viewport = document.createElement('div');

    // Mock ResizeObserver
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.ResizeObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    // Mock window.getComputedStyle
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () =>
        ({
          paddingLeft: '0px',
          paddingRight: '0px',
          paddingTop: '0px',
          paddingBottom: '0px',
        }) as CSSStyleDeclaration,
    );
  });

  describe('Initialization', () => {
    it('should create a canvas element on initialization', () => {
      expect(editor.getCanvas()).toBeInstanceOf(HTMLCanvasElement);
    });

    it('should initialize with default zoom 1 and offset 0,0', () => {
      expect(editor.getZoom()).toBe(1);
      expect(editor.getOffset()).toEqual({ x: 0, y: 0 });
    });
  });

  describe('Mounting', () => {
    it('should append canvas to container on mount', () => {
      editor.mount(container, viewport);
      expect(container.contains(editor.getCanvas())).toBe(true);
    });

    it('should disconnect observer and remove canvas on unmount', () => {
      editor.mount(container, viewport);
      const canvasRemoveSpy = vi.spyOn(editor.getCanvas(), 'remove');

      editor.unmount();

      expect(canvasRemoveSpy).toHaveBeenCalled();
    });
  });

  describe('Image Loading', () => {
    it('should resolve true when image loads successfully', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      global.Image = class {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onload: any;
        set src(_val: string) {
          setTimeout(() => this.onload(), 0);
        }
        naturalWidth = 100;
        naturalHeight = 100;
        crossOrigin = '';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const result = await editor.loadImage('test.jpg');
      expect(result).toBe(true);
    });
  });

  describe('Transformations (Zoom & Offset)', () => {
    it('should update zoom and call render', () => {
      const renderSpy = vi.spyOn(editor, 'render');
      editor.setZoom(2);
      expect(editor.getZoom()).toBe(2);
      expect(renderSpy).toHaveBeenCalled();
    });

    it('should update offset and call render', () => {
      const renderSpy = vi.spyOn(editor, 'render');
      editor.setOffset({ x: 10, y: 20 });
      expect(editor.getOffset()).toEqual({ x: 10, y: 20 });
      expect(renderSpy).toHaveBeenCalled();
    });
  });

  describe('Render logic', () => {
    it('should not render if image is not loaded', () => {
      const ctx = editor.getCanvas().getContext('2d')!;
      const clearRectSpy = vi.spyOn(ctx, 'clearRect');
      editor.render();
      expect(clearRectSpy).not.toHaveBeenCalled();
    });

    it('should call context methods during render', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (editor as any).img = { naturalWidth: 100, naturalHeight: 100 };
      const ctx = editor.getCanvas().getContext('2d')!;
      const fillRectSpy = vi.spyOn(ctx, 'fillRect');
      const drawImageSpy = vi.spyOn(ctx, 'drawImage');

      editor.render();

      expect(fillRectSpy).toHaveBeenCalled();
      expect(drawImageSpy).toHaveBeenCalled();
    });
  });

  describe('Filters and Quality', () => {
    it('should update filters and re-render', () => {
      const renderSpy = vi.spyOn(editor, 'render');
      const filters = new Map<FilterKey, number>();
      filters.set('brightness', 120);

      editor.setFilters(filters);
      expect(renderSpy).toHaveBeenCalled();
    });

    it('should update quality and trigger fitToContainer', () => {
      const fitSpy = vi.spyOn(editor, 'fitToContainer');
      editor.setQuality(80);
      expect(fitSpy).toHaveBeenCalled();
    });
  });

  describe('Dimensions', () => {
    it('should update canvas style and buffer size', () => {
      const canvas = editor.getCanvas();
      editor.setDimensions(500, 300);

      expect(canvas.style.width).toBe('500px');
      expect(canvas.style.height).toBe('300px');
      expect(canvas.width).toBe(500);
      expect(canvas.height).toBe(300);
    });
  });
});
