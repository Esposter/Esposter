import type { Position } from "grid-engine";
import type { Except } from "type-fest";

export const INITIAL_CURSOR_POSITION = { x: 20, y: 41 } as const satisfies Position;
export const CURSOR_POSITION_INCREMENT = { y: 50 } as const satisfies Except<Position, "x">;

export const MENU_BACKGROUND_WIDTH = 230;
