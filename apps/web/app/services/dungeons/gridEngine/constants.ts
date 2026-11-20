// A step's progress runs from zero to this, as the engine counts it, and a sprite's frame turns at its midpoint
export const STEP_PROGRESS = 1000;
export const HALF_STEP_PROGRESS = STEP_PROGRESS / 2;
// A depth is a pixel count padded to this many digits, so a lower sprite draws in front of a higher one
export const DEPTH_PADDING_DIGITS = 7;
