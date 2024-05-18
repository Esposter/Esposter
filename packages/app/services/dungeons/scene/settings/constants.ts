import type { Position } from "grid-engine";
import type { Except } from "type-fest";

export const MENU_HORIZONTAL_PADDING = 100;
export const MENU_VERTICAL_PADDING = 20;
export const MENU_HEIGHT = 432;

export const INITIAL_SETTINGS_POSITION = { x: 25, y: 55 } as const satisfies Position;
export const SETTINGS_POSITION_INCREMENT = { y: 55 } as const satisfies Except<Position, "x">;
export const INITIAL_SETTINGS_VALUE_POSITION = { x: 320 } as const satisfies Except<Position, "y">;
export const SETTINGS_VALUE_POSITION_INCREMENT = { x: 170 } as const satisfies Except<Position, "y">;

export const VOLUME_SLIDER_BAR_WIDTH = 300;
export const VOLUME_SLIDER_WIDTH = 10;
export const VOLUME_SLIDER_HEIGHT = 25;
export const VOLUME_SLIDER_START_X = INITIAL_SETTINGS_VALUE_POSITION.x;
export const VOLUME_SLIDER_END_X = VOLUME_SLIDER_START_X + VOLUME_SLIDER_BAR_WIDTH - VOLUME_SLIDER_WIDTH;
