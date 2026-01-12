/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFactory } from '@withease/factories';
import {
  type Effect,
  type EventCallable,
  createEvent,
  createStore,
  sample,
} from 'effector';
import { delay } from 'patronum';

export const createDialogInstance = createFactory(creator);

interface Creator {
  onAfterClosed?:
    | EventCallable<any>
    | EventCallable<any>[]
    | Effect<any, any>
    | Effect<any, any>[];
  trigger?:
    | EventCallable<any>
    | EventCallable<any>[]
    | Effect<any, any>
    | Effect<any, any>[];
  isOpened?: boolean;
}

function creator(props: Creator = {}) {
  const { isOpened = false, trigger, onAfterClosed } = props;

  const open = createEvent();
  const close = createEvent();
  const toggle = createEvent();
  const afterClosed = delay(close, 200);

  const $isOpened = createStore(isOpened)
    .on(open, () => true)
    .on(toggle, isOpened => !isOpened)
    .reset(close);

  if (trigger) {
    sample({
      clock: Array.isArray(trigger) ? trigger : [trigger],
      fn: () => true,
      target: $isOpened,
    });
  }
  if (onAfterClosed) {
    sample({
      clock: afterClosed,
      target: Array.isArray(onAfterClosed) ? onAfterClosed : [onAfterClosed],
    });
  }

  return {
    open,
    close,
    toggle,
    afterClosed,
    $isOpened,
  };
}
