import type { VBtn } from "vuetify/components";

// The shape every drafts & sent row action takes, whether it opens a menu or fires directly
export const DRAFTS_AND_SENT_ACTION_BUTTON_PROPS = Object.freeze({
  density: "comfortable",
  size: "small",
  variant: "text",
} satisfies VBtn["$props"]);
