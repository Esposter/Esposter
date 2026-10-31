import type { DestroyRule } from "#src/models/inventory/DestroyRule";
import type { ItemCategory } from "genshin-interface/save";

// An item as the game defines it, by its item id: the tab it is filed in, or none when the bag holds the item but draws
// It in no tab, its name in the reader's language, its rarity in stars, how many of it one stack holds, and its rank,
// The place the game gives it in its tab's own order. A weapon or an artifact also carries the game's destroy rule and
// What a destroy returns; an entry without a rule is never destroyed
export interface ItemDefinition {
  category?: ItemCategory;
  destroyReturnMaterial?: number;
  destroyReturnMaterialCount?: number;
  destroyRule?: DestroyRule;
  id: number;
  name: string;
  rank: number;
  rarity: number;
  stackLimit: number;
}
