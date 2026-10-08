import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { GameText } from "genshin-text";

import materialsJson from "#src/data/items/materials.json";
import { materialDataSchema } from "#src/models/inventory/MaterialData";
import { toItemDefinition } from "#src/services/inventory/toItemDefinition";
import { createUniqueArraySchema, InvalidOperationError, Operation } from "@esposter/shared";

// Every item the world's drops name, read from the game's material table and checked against its schema as the world
// Loads
const materialDataMap = new Map(
  createUniqueArraySchema(materialDataSchema, "id")
    .parse(materialsJson)
    .map((materialData) => [materialData.id, materialData]),
);

// An item's definition in the reader's language, its name read from the game text by its text id
export const getItemDefinition = (itemId: number, gameText: GameText): ItemDefinition => {
  const materialData = materialDataMap.get(itemId);
  if (!materialData)
    throw new InvalidOperationError(Operation.Read, String(itemId), "has no row in the materials' table");
  return toItemDefinition(materialData, gameText);
};
