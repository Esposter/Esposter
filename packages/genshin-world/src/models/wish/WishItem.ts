import type { WishItemKind } from "#src/models/wish/WishItemKind";

// A character or weapon a wish can draw, by the game's id for it, with its rarity in stars
export interface WishItem {
  id: number;
  kind: WishItemKind;
  rarity: number;
}
