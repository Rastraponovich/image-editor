import { createEvent, createStore } from 'effector';

export const sidebarToggled = createEvent();

export const $isSidebarOpen = createStore(true).on(
  sidebarToggled,
  state => !state,
);
