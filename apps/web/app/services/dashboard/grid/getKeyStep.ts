import type { GridStep } from "vue-grid-layout-headless";

// An arrow key moves a focused visual one cell, and with Shift it resizes the visual one cell from its bottom-right corner
const MOVE_STEP_MAP = new Map<string, GridStep>([
  ["ArrowDown", { dy: 1 }],
  ["ArrowLeft", { dx: -1 }],
  ["ArrowRight", { dx: 1 }],
  ["ArrowUp", { dy: -1 }],
]);
const RESIZE_STEP_MAP = new Map<string, GridStep>([
  ["ArrowDown", { dh: 1 }],
  ["ArrowLeft", { dw: -1 }],
  ["ArrowRight", { dw: 1 }],
  ["ArrowUp", { dh: -1 }],
]);

export const getKeyStep = (event: KeyboardEvent): GridStep | undefined =>
  (event.shiftKey ? RESIZE_STEP_MAP : MOVE_STEP_MAP).get(event.key);
