import type { WishItemKind } from "#src/models/wish/WishItemKind";

// A character or weapon a wish can draw, by the game's id for it, with its name in the reader's language and its rarity
// In stars
export interface WishItem {
  id: number;
  kind: WishItemKind;
  name: string;
  rarity: number;
}
