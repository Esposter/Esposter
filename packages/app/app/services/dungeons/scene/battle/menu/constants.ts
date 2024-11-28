import type { Position } from "grid-engine";

export const MENU_PADDING = 4;
export const MENU_HEIGHT = 124;

export const INITIAL_CURSOR_POSITION = { x: 42, y: 38 } as const satisfies Position;
export const CURSOR_POSITION_INCREMENT = { x: 186, y: 48 } as const satisfies Position;
