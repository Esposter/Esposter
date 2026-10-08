import type { ScreenKind } from "#src/models/screen/ScreenKind";
import type { Component } from "vue";

// The screens built so far, each drawn over the world when it is open: a screen here takes the game's words as its
// `gameText` and emits `close` to go back to the world. A screen with no entry opens as a placeholder under its title,
// And its Paimon menu entry is disabled
export const ScreenKindComponentMap: Readonly<Partial<Record<ScreenKind, Component>>> = {};
