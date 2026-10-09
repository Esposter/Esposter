import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { MaterialData } from "#src/models/inventory/MaterialData";

import { MaterialTypeItemCategoryMap } from "#src/services/inventory/MaterialTypeItemCategoryMap";
import { InvalidOperationError, Operation } from "@esposter/shared";

// An item's definition in the reader's language, from its row of the materials table, its name read from the names
// By their text id, which a name missing from them is an error for
export const toItemDefinition = (
  materialData: MaterialData,
  names: Readonly<Record<string, string>>,
): ItemDefinition => {
  const name = names[materialData.nameTextId];
  if (name === undefined)
    throw new InvalidOperationError(Operation.Read, materialData.nameTextId, "names no text in the reader's language");
  return {
    category: MaterialTypeItemCategoryMap[materialData.materialType],
    id: materialData.id,
    name,
    rank: materialData.rank,
    rarity: materialData.rarity,
    stackLimit: materialData.stackLimit,
  };
};
