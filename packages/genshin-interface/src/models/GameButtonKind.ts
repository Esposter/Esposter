// The game's button templates, each with its own look in every state: a choice, a slate pill with a dark disc at its left
// That its screen's mark sits in (the quit prompt's Cancel and Confirm), an icon a disc lights behind (the Paimon menu's
// Side bar), the cream pill (the quit prompt's choices), a plain one the game draws no state for (the profile card's
// Info icon), which a keyboard's focus rings in the game's white, a row, a rectangle a tint lights over (a menu's Tab or
// List entry), a reply, the dialogue's translucent black pill, which the cream Pill does not match, and a gold pill, the
// weapon screen's lit Ascend
export enum GameButtonKind {
  Choice = "Choice",
  Disc = "Disc",
  Gold = "Gold",
  Pill = "Pill",
  Plain = "Plain",
  Reply = "Reply",
  Row = "Row",
}
