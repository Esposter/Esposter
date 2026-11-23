// The game's button templates, each with its own look in every state. A choice. A slate pill, with a dark disc at its
// Left that its screen's mark sits in (the quit prompt's Cancel and Confirm). An icon a disc lights behind (the Paimon
// Menu's Side bar). The cream pill, a screen's option buttons. A plain one the game draws no state for (the profile
// Card's Info icon), which a keyboard's focus rings in the game's white. A row, a rectangle a tint lights over (a
// Menu's Tab or List entry). A reply. The dialogue's translucent black pill, which the cream Pill does not match. A
// Gold pill, the weapon screen's lit Ascend.
export const GameButtonKind = {
  Choice: "Choice",
  Disc: "Disc",
  Gold: "Gold",
  Pill: "Pill",
  Plain: "Plain",
  Reply: "Reply",
  Row: "Row",
} as const;
export type GameButtonKind = (typeof GameButtonKind)[keyof typeof GameButtonKind];
