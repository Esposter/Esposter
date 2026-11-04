import type { GridStep } from "vue-grid-layout-headless";

// An arrow key moves a focused visual one cell, and with Shift it resizes the visual one cell from its bottom-right corner
const STEP_MAP = new Map<string, { move: GridStep; resize: GridStep }>([
  ["ArrowDown", { move: { dy: 1 }, resize: { dh: 1 } }],
  ["ArrowLeft", { move: { dx: -1 }, resize: { dw: -1 } }],
  ["ArrowRight", { move: { dx: 1 }, resize: { dw: 1 } }],
  ["ArrowUp", { move: { dy: -1 }, resize: { dh: -1 } }],
]);

export const getKeyStep = (event: KeyboardEvent): GridStep | undefined => {
  const step = STEP_MAP.get(event.key);
  return event.shiftKey ? step?.resize : step?.move;
};
