import type { ItemCategory } from "genshin-interface";

// An item as the game defines it, by its item id: the tab it is filed in, its name in the reader's language, its rarity
// In stars, how many of it one stack holds, and its rank, the place the game gives it in its tab's own order
export interface ItemDefinition {
  category: ItemCategory;
  id: number;
  name: string;
  rank: number;
  rarity: number;
  stackLimit: number;
}
