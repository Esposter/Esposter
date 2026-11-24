// The game's button templates, each with its own look in every state.
// Choice is a slate pill with a dark disc at its left, which its screen's mark sits in.
// Disc is an icon that a disc lights behind, such as the Paimon menu's side bar.
// Pill is the cream pill of a screen's option buttons.
// Plain is a button the game draws no state for, such as the profile card's info icon.
// Row is a rectangle a tint lights over, such as a menu's tab or list entry.
// Reply is the dialogue's translucent black pill, which the cream pill does not match.
// Gold is the weapon screen's lit ascend pill.
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
