import { allSettled, fork } from 'effector';
import { describe, expect, it } from 'vitest';

import { BUTTON_ZOOM_STEP, MAX_ZOOM, MIN_ZOOM } from '../constants';
import {
  $offset,
  $zoom,
  resetZoomClicked,
  zoomInClicked,
  zoomOutClicked,
} from '../model';

describe('Viewport Control Feature', () => {
  it('should increase zoom when zoomInClicked is triggered', async () => {
    const scope = fork();
    await allSettled(zoomInClicked, { scope });
    expect(scope.getState($zoom)).toBe(1 + BUTTON_ZOOM_STEP);
  });

  it('should decrease zoom when zoomOutClicked is triggered', async () => {
    const scope = fork({
      values: [[$zoom, 2]],
    });
    await allSettled(zoomOutClicked, { scope });
    expect(scope.getState($zoom)).toBe(2 - BUTTON_ZOOM_STEP);
  });

  it('should not exceed MAX_ZOOM', async () => {
    const scope = fork({
      values: [[$zoom, MAX_ZOOM]],
    });
    await allSettled(zoomInClicked, { scope });
    expect(scope.getState($zoom)).toBe(MAX_ZOOM);
  });

  it('should not go below MIN_ZOOM', async () => {
    const scope = fork({
      values: [[$zoom, MIN_ZOOM]],
    });
    await allSettled(zoomOutClicked, { scope });
    expect(scope.getState($zoom)).toBe(MIN_ZOOM);
  });

  it('should reset transform', async () => {
    const scope = fork({
      values: [
        [$zoom, 2],
        [$offset, { x: 100, y: 100 }],
      ],
    });
    await allSettled(resetZoomClicked, { scope });
    expect(scope.getState($zoom)).toBe(1);
    expect(scope.getState($offset)).toEqual({ x: 0, y: 0 });
  });
});
