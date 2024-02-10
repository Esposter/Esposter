import { type Position } from "grid-engine";

export const INITIAL_CURSOR_POSITION = { x: 42, y: 38 } as const satisfies Position;
export const INITIAL_PLAYER_INPUT_PROMPT_CURSOR_POSITION = { y: 480 } as const satisfies Pick<Position, "y">;

export const MENU_PADDING = 4;
export const MENU_HEIGHT = 124;
