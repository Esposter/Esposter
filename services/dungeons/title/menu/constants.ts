import type { Except } from "@/util/types/Except";
import type { Position } from "grid-engine";

export const INITIAL_CURSOR_POSITION = { x: 35 } as const satisfies Except<Position, "y">;

export const MENU_BACKGROUND_DISPLAY_WIDTH = 270;
