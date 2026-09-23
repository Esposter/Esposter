// The terminal's spinner: a star that grows and shrinks back, a frame at a time
export const SPINNER_FRAMES = ["·", "✢", "✳", "✶", "✻", "✽", "✻", "✶", "✳", "✢"];
export const SPINNER_INTERVAL_MS = Temporal.Duration.from({ milliseconds: 120 }).total("milliseconds");
// How long a toast that closes itself stays, long enough to read one sentence
export const TOAST_DURATION_MS = Temporal.Duration.from({ seconds: 5 }).total("milliseconds");
// How many voxel blocks the loading bar is made of
export const LOADING_BAR_BLOCK_COUNT = 16;
// How long a pause in typing ends a typeahead search, so the next key starts a new one — the listbox pattern's figure
export const TYPEAHEAD_RESET_MS = Temporal.Duration.from({ milliseconds: 500 }).total("milliseconds");
// Where a popover opens against what it hangs off: below it and aligned to its start, flipped to the other side or
// The other end where there is no room
export const POPOVER_POSITION_AREA = "bottom span-right";
export const POPOVER_POSITION_TRY = "flip-block, flip-inline, flip-block flip-inline";
