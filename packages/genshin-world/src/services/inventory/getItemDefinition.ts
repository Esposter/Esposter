import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { MaterialData } from "#src/models/inventory/MaterialData";

import { toItemDefinition } from "#src/services/inventory/toItemDefinition";
import { InvalidOperationError, Operation } from "@esposter/shared";

// An item's definition in the reader's language, its row read from the game's material table by its id and its name
// From the name-text chunks by its text id
export const getItemDefinition = (
  itemId: number,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): ItemDefinition => {
  const materialData = materialDataMap.get(itemId);
  if (!materialData)
    throw new InvalidOperationError(Operation.Read, String(itemId), "has no row in the materials' table");
  return toItemDefinition(materialData, names);
};
