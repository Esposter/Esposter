import { type Position } from "grid-engine";

export const INITIAL_CURSOR_POSITION: Position = { x: 42, y: 38 };
export const INITIAL_PLAYER_INPUT_PROMPT_CURSOR_POSITION: Pick<Position, "y"> = { y: 480 };

export const MENU_PADDING = 4;
export const MENU_HEIGHT = 124;
