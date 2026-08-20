import type { VBtn } from "vuetify/components";

// The shape every friends-list row action takes — accept, decline, remove, block, unblock — each of which
// Differs only in its colour and its label
export const FRIENDS_ACTION_BUTTON_PROPS = Object.freeze({
  size: "small",
  variant: "tonal",
} satisfies VBtn["$props"]);
