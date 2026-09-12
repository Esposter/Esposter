import type { VBtn, VCard, VDialog } from "vuetify/components";

export const EMOJI_PICKER_TOOLTIP_TEXT = "Add Reaction";
// Width nudged per arrow press on a resize handle, in the px the width model is kept in
export const RESIZE_HANDLE_KEYBOARD_STEP = 16;

export const CLOSE_DIALOG_BUTTON_PROPS = Object.freeze({
  density: "comfortable",
  variant: "text",
} satisfies VBtn["$props"]);
// The same shape every other icon button in a row or a toolbar has, so a delete never reads as a different kind of
// Control beside the copy and edit buttons it sits with
export const DELETE_DIALOG_BUTTON_PROPS = Object.freeze({ size: "small" } satisfies VBtn["$props"]);

export const RETRY_BUTTON_PROPS = Object.freeze({ prependIcon: "mdi-refresh", text: "Retry" } satisfies VBtn["$props"]);

export const KEYBOARD_SHORTCUTS_CARD_PROPS = Object.freeze({
  prependIcon: "mdi-keyboard",
  title: "Keyboard Shortcuts",
} satisfies VCard["$props"]);

export const KEYBOARD_SHORTCUTS_DIALOG_PROPS = Object.freeze({ maxWidth: "30rem" } satisfies VDialog["$props"]);

export const SEARCH_DIALOG_PROPS = Object.freeze({ width: "37.5rem" } satisfies VDialog["$props"]);
