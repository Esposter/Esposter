// Why a character or a weapon cannot ascend now: it is not at its phase's level cap, the table has not published the next
// Phase's costs, or the player's Adventure Rank, the wallet's Mora or the bag's items fall short
export const AscensionRefusal = {
  AdventureRank: "AdventureRank",
  Cap: "Cap",
  Materials: "Materials",
  Mora: "Mora",
  Unpublished: "Unpublished",
} as const;
export type AscensionRefusal = (typeof AscensionRefusal)[keyof typeof AscensionRefusal];
