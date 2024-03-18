import type { Position } from "grid-engine";

export const MAX_STEPS_BEFORE_NEXT_ENCOUNTER = 20;

export const DIALOG_PADDING = 90;
export const DIALOG_WIDTH = 1280 - DIALOG_PADDING * 2;
export const DIALOG_HEIGHT = 124;
export const DIALOG_DEPTH = 2000;

export const MENU_PADDING = 4;
export const MENU_WIDTH = 300;
export const MENU_DEPTH = 3000;

export const INITIAL_MENU_CURSOR_POSITION = { x: 20 + MENU_PADDING, y: 28 + MENU_PADDING } as const satisfies Position;
export const MENU_CURSOR_POSITION_INCREMENT = { x: 30, y: 50 } as const satisfies Position;
