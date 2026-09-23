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
// Where a tooltip opens against what it names: above it, unless the region around it says otherwise through the custom
// Property, as the dock's rail does to open them beside it
export const TOOLTIP_POSITION_AREA = "var(--ui-tooltip-position-area, top)";
// How long a finger rests on a touch screen before the context menu opens under it, the platforms' own long press
export const LONG_PRESS_MS = Temporal.Duration.from({ milliseconds: 500 }).total("milliseconds");
// How far a resting finger may drift, in CSS pixels, before the press counts as the start of a scroll instead
export const LONG_PRESS_MOVE_TOLERANCE = 10;
// Where the browser's own context menu is worth more than ours: in a field, with its spell-check and paste
export const CONTEXT_MENU_EDITABLE_SELECTOR = 'input, textarea, [contenteditable=""], [contenteditable="true"]';
// The library's own tooltips, apart from any a primitive opens under its default namespace
export const TOOLTIP_NAMESPACE = "ui:tooltip";
