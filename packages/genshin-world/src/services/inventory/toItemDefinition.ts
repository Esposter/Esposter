import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { MaterialData } from "#src/models/inventory/MaterialData";

import { getItemName } from "#src/services/inventory/getItemName";
import { MaterialTypeItemCategoryMap } from "#src/services/inventory/MaterialTypeItemCategoryMap";

// An item's definition in the reader's language, from its row of the materials table, its name read from the names
// By their text id
export const toItemDefinition = (
  materialData: MaterialData,
  names: Readonly<Record<string, string>>,
): ItemDefinition => ({
  category: MaterialTypeItemCategoryMap[materialData.materialType],
  id: materialData.id,
  name: getItemName(materialData.nameTextId, names),
  rank: materialData.rank,
  rarity: materialData.rarity,
  stackLimit: materialData.stackLimit,
});
