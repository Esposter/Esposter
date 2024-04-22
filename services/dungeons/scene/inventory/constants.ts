import type { Except } from "@/util/types/Except";
import type { Position } from "grid-engine";

export const MENU_PADDING = 4;
export const CONTENT_MENU_WIDTH = 700;

export const INITIAL_CURSOR_POSITION = { x: 30, y: 30 } as const satisfies Position;
export const CURSOR_POSITION_INCREMENT = { y: 50 } as const satisfies Except<Position, "x">;
