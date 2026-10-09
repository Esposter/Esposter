import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { GameText } from "genshin-text";

import { MaterialTypeItemCategoryMap } from "#src/services/inventory/MaterialTypeItemCategoryMap";

// An item's definition in the reader's language, from its row of the materials table, its name read from the game text
// By its text id
export const toItemDefinition = (materialData: MaterialData, gameText: GameText): ItemDefinition => ({
  category: MaterialTypeItemCategoryMap[materialData.materialType],
  id: materialData.id,
  name: gameText[materialData.nameTextId],
  rank: materialData.rank,
  rarity: materialData.rarity,
  stackLimit: materialData.stackLimit,
});
