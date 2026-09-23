// @unocss-include
import type { VBtn } from "vuetify/components";

export const EMOJI_PICKER_TOOLTIP_TEXT = "Add Reaction";
// Width nudged per arrow press on a resize handle, in the px the width model is kept in
export const RESIZE_HANDLE_KEYBOARD_STEP = 16;

// The same shape every other icon button in a row or a toolbar has, so a delete never reads as a different kind of
// Control beside the copy and edit buttons it sits with
export const DELETE_DIALOG_BUTTON_PROPS = Object.freeze({ size: "small" } satisfies VBtn["$props"]);

export const RETRY_BUTTON_PROPS = Object.freeze({
  prependIcon: "i-mdi:refresh",
  text: "Retry",
} satisfies VBtn["$props"]);
