import type { DestroyRule } from "#src/models/inventory/DestroyRule";
import type { ItemCategory } from "genshin-interface";

// An item as the game defines it, by its item id: the tab it is filed in, or none for an item the bag holds and draws in
// No tab, its name in the reader's language, its rarity in stars, how many of it one stack holds, and its rank, the place
// The game gives it in its tab's own order. A weapon or an artifact also carries the game's destroy rule and what a
// Destroy returns; an entry without a rule is never destroyed
export interface ItemDefinition {
  category: ItemCategory | undefined;
  destroyReturnMaterial?: number;
  destroyReturnMaterialCount?: number;
  destroyRule?: DestroyRule;
  id: number;
  name: string;
  rank: number;
  rarity: number;
  stackLimit: number;
}
