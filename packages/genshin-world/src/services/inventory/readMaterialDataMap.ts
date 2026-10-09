import type { MaterialData } from "#src/models/inventory/MaterialData";

import { materialDataSchema } from "#src/models/inventory/MaterialData";
import { readGameData } from "#src/services/data/readGameData";
import { createUniqueArraySchema } from "@esposter/shared";

// Every item the world's drops, rewards and recipes name, by its id, read from the game's material table as
// `pnpm -C scripts genshin:assets items` builds it, fetched by its key from the hosted game data and checked against
// Its schema as it arrives
export const readMaterialDataMap = async (gameDataBaseUrl: string): Promise<ReadonlyMap<number, MaterialData>> => {
  const materials = await readGameData(
    gameDataBaseUrl,
    "items/materials",
    createUniqueArraySchema(materialDataSchema, "id"),
  );
  return new Map(materials.map((materialData) => [materialData.id, materialData]));
};
