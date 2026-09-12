import type { VBtn } from "vuetify/components";

export const DRAG_HANDLE_CLASS = "drag-handle";
export const MAX_HISTORY_SIZE = 50;
export const OUTLIER_HIGHLIGHT_CLASS = "bg-orange-100 ring-1 ring-orange-400";
export const OUTLIER_STANDARD_DEVIATION_MULTIPLIER = 2;
// The two occurrence-stepping buttons of the find-and-replace bar are one shape, differing only in direction.
export const OCCURRENCE_BUTTON_PROPS = Object.freeze({ size: "small", variant: "text" } satisfies VBtn["$props"]);
