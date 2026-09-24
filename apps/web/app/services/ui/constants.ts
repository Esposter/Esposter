import type { UiStyle } from "@/models/ui/UiStyle";
import type { InjectionKey, Ref } from "vue";

// The terminal's spinner: a star that grows and shrinks back, a frame at a time
export const SPINNER_FRAMES = ["·", "✢", "✳", "✶", "✻", "✽", "✻", "✶", "✳", "✢"];
export const SPINNER_INTERVAL_MS = Temporal.Duration.from({ milliseconds: 120 }).total("milliseconds");
// How long a toast that closes itself stays, long enough to read one sentence
export const TOAST_DURATION_MS = Temporal.Duration.from({ seconds: 5 }).total("milliseconds");
// How many voxel blocks the loading bar is made of
export const LOADING_BAR_BLOCK_COUNT = 16;
// How many rows a data table's skeleton stands in with while its first page is on its way
// The page sizes a table that holds every row offers, -1 for all of them
export const DATA_TABLE_ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100, -1];
export const DATA_TABLE_SKELETON_ROW_COUNT = 5;
// How many voxel blocks a meter is made of: a tenth of the whole each, so a reading is counted at a glance
export const METER_BLOCK_COUNT = 10;
// How long a pause in typing ends a typeahead search, so the next key starts a new one — the listbox pattern's figure
export const TYPEAHEAD_RESET_MS = Temporal.Duration.from({ milliseconds: 500 }).total("milliseconds");
// Where a popover opens against what it hangs off: below it and aligned to its start, flipped to the other side or
// The other end where there is no room
export const POPOVER_POSITION_AREA = "bottom span-right";
export const POPOVER_POSITION_TRY = "flip-block, flip-inline, flip-block flip-inline";
// How many chosen titles a select holding several lists on its trigger, past which it reads how many are chosen
export const SELECT_TRIGGER_TITLE_LIMIT = 3;
// Where a tooltip opens against what it names: above it, unless the region around it says otherwise through the custom
// Property, as the dock's rail does to open them beside it
export const TOOLTIP_POSITION_AREA = "var(--ui-tooltip-position-area, top)";
// How long a finger rests on a touch screen before the context menu opens under it, the platforms' own long press
export const LONG_PRESS_MS = Temporal.Duration.from({ milliseconds: 500 }).total("milliseconds");
// How far a resting finger may drift, in CSS pixels, before the press counts as the start of a scroll instead
export const LONG_PRESS_MOVE_TOLERANCE = 10;
// Where the browser's own context menu is worth more than ours: in a field, with its spell-check and paste
export const CONTEXT_MENU_EDITABLE_SELECTOR = 'input, textarea, [contenteditable=""], [contenteditable="true"]';
export const READABLE_TEXT_COOKIE_NAME = "readable-text";
export const UI_STYLE_COOKIE_NAME = "ui-style";
// The style the nearest theme scope draws in, or the reader's around the whole app, which the icon and any scope read
export const UI_STYLE_INJECTION_KEY: InjectionKey<Readonly<Ref<UiStyle>>> = Symbol("uiStyle");
// The library's own tooltips, apart from any a primitive opens under its default namespace
export const TOOLTIP_NAMESPACE = "ui:tooltip";
// How many weeks a calendar's month shows, always six, so the grid keeps its height from one month to the next
export const CALENDAR_WEEK_COUNT = 6;
// How many events a day of an event calendar's month lists before the rest fold into a count that opens the day
export const CALENDAR_DAY_EVENT_LIMIT = 3;
// How long one slot of a week's or a day's hours is, the finest an event dragged onto one lands
export const CALENDAR_SLOT_DURATION = Temporal.Duration.from({ minutes: 30 });
// A working day, Outlook's default of eight to five: a week's or a day's hours open scrolled to its start and shade the
// Hours outside it, and a day of a month an event is created on starts at its start
export const CALENDAR_OPENING_HOUR = 8;
export const CALENDAR_CLOSING_HOUR = 17;
// How many days a work week holds from the start of the week, Monday to Friday
export const CALENDAR_WORK_WEEK_DAY_COUNT = 5;
// Width nudged per arrow press on a resize handle, in the px the width model is kept in
export const RESIZE_HANDLE_KEYBOARD_STEP = 16;
// How often a calendar reads the clock, so today's ring and the current-time line move on without a reload
export const CALENDAR_CLOCK_INTERVAL_MS = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
