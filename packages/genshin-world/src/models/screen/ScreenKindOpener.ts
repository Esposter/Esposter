// How the player opens a screen kind: from the Paimon menu's contents, by a shortcut (an input action or the shortcut
// Wheel), by an interaction with the world (a resident, a gadget, a trigger), or, for the world itself, not at all
export const ScreenKindOpener = {
  Interaction: "Interaction",
  PaimonMenu: "PaimonMenu",
  Shortcut: "Shortcut",
  World: "World",
} as const;
export type ScreenKindOpener = (typeof ScreenKindOpener)[keyof typeof ScreenKindOpener];
