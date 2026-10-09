import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import { readMondstadtExpeditionPlaces } from "#src/services/genshinAssets/expeditions/readMondstadtExpeditionPlaces";
import { MATERIAL_TABLE_FILENAME, MATERIALS_PATH } from "#src/services/genshinAssets/items/constants";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { EXCEL_DIRECTORY } from "#src/services/genshinText/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameTextKeys } from "genshin-text";
import {
  ADVENTURE_EXP_ITEM_ID,
  EnemyDropFamilyDropTableMap,
  FORGE_ENHANCEMENT_TYPE,
  MORA_ITEM_ID,
  readForgeRecipes,
} from "genshin-world";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The items every drop family's table names and every expedition's reward preview gives, each read from the game's
// Material table with its name's text id, which must be a key of the game text so the world can show it. Mora is a
// Currency the wallet holds, so it is no item here. An item the table lacks, or a name no key holds, is an error.
// The enhancement ores' forge items join them too, their ingredients and results, the bag taking a result by its
// Definition. The Adventure EXP is a virtual item the Adventure Rank takes, so it is no item here. Returns the file's path
export const writeItems = async (): Promise<string> => {
  const expeditionItemIds = readMondstadtExpeditionPlaces().flatMap(({ durations }) =>
    durations.flatMap(({ items }) => items.map(({ itemId }) => itemId)),
  );
  const forgeRecipes = (await readForgeRecipes()).filter(({ forgeType }) => forgeType === FORGE_ENHANCEMENT_TYPE);
  const forgeItemIds = [
    ...forgeRecipes.flatMap(({ materials }) => materials.map(({ id }) => id)),
    ...forgeRecipes.flatMap(({ results }) => results.map(({ itemId }) => itemId)),
  ];
  const materialRows = parseMachineJson<MaterialRow[]>(
    await readFile(join(EXCEL_DIRECTORY, MATERIAL_TABLE_FILENAME), "utf8"),
  );
  const itemIds = [
    ...new Set([
      ...Object.values(EnemyDropFamilyDropTableMap).flatMap(({ materials }) => materials.map(({ itemId }) => itemId)),
      ...expeditionItemIds,
      ...forgeItemIds,
    ]),
  ]
    .filter((itemId) => itemId !== MORA_ITEM_ID && itemId !== ADVENTURE_EXP_ITEM_ID)
    .toSorted((firstId, secondId) => firstId - secondId);
  const items = itemIds.map((itemId) => {
    const materialRow = materialRows.find(({ id }) => id === itemId);
    if (!materialRow)
      throw new InvalidOperationError(Operation.Read, String(itemId), "has no row in the material table");
    const nameTextId = String(materialRow.nameTextMapHash);
    if (!GameTextKeys.some((gameTextKey) => gameTextKey === nameTextId))
      throw new InvalidOperationError(Operation.Read, String(itemId), "names no game text key");
    return {
      id: materialRow.id,
      materialType: materialRow.materialType,
      nameTextId,
      rank: materialRow.rank,
      rarity: materialRow.rankLevel,
      stackLimit: materialRow.stackLimit,
    };
  });
  return writeWorldData(MATERIALS_PATH, items);
};
