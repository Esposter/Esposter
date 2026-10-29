// Measured from a 60-frame recording of the game's window: the marks fade in linearly over this long when the screen
// Starts and fade out over the same once loading completes, the white then holds for this long, and the world cuts in
// With no crossfade. Each wipe step lands within one frame, with no easing
export const MARKS_FADE_MS = 280;
export const WHITE_HOLD_MS = 700;
// The prefix of each load step's performance measure, which DevTools' Timings track shows and the parity page's `load` reads
export const LOAD_STEP_MEASURE_PREFIX = "genshin:load:";
// The share of the startup loading bar the bytes downloaded fill while any are pending, the world's own steps filling the
// Rest, and the bytes a megabyte is counted in when a download's size is shown
export const LOADING_BYTES_SHARE = 0.7;
export const BYTES_PER_MEGABYTE = 1_000_000;
