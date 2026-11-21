import { Direction } from "#src/models/Direction";

// A step is one tile, so its progress runs from zero to this. Progress grows by a character's speed in tiles a second
// Times the update's delta in milliseconds, so the default speed takes a quarter of a second to cross a tile
export const STEP_PROGRESS = 1000;
export const DEFAULT_SPEED = 4;
export const DEFAULT_FACING_DIRECTION: Direction = Direction.Down;
