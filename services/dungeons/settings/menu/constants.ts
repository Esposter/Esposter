import type { Except } from "@/util/types/Except";
import type { Position } from "grid-engine";

export const INITIAL_SETTINGS_POSITION = { x: 25, y: 55 } as const satisfies Position;
export const SETTINGS_POSITION_INCREMENT = { y: 55 } as const satisfies Except<Position, "x">;
export const INITIAL_SETTINGS_VALUE_POSITION = { x: 320 } as const satisfies Except<Position, "y">;
export const SETTINGS_VALUE_POSITION_INCREMENT = { x: 170 } as const satisfies Except<Position, "y">;

export const MENU_HORIZONTAL_PADDING = 100;
export const MENU_VERTICAL_PADDING = 20;
export const MENU_HEIGHT = 432;
