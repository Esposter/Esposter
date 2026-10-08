// One character or weapon a banner can draw, as its pool lists it: the game's id for it, its name in the reader's
// Language, its rarity in stars, and whether the banner features it
export interface WishPoolCell {
  id: number;
  isFeatured: boolean;
  name: string;
  rarity: number;
}
