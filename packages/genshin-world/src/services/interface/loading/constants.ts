// Measured from a 60-frame recording of the game's window: the marks fade in linearly over this long when the screen
// Starts and fade out over the same once loading completes, the white then holds for this long, and the world cuts in
// With no crossfade. Each wipe step lands within one frame, with no easing
export const MARKS_FADE_MS = 280;
export const WHITE_HOLD_MS = 700;
