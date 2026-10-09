import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import { readMondstadtExpeditionPlaces } from "#src/services/genshinAssets/expeditions/readMondstadtExpeditionPlaces";
import { MATERIAL_TABLE_FILENAME, MATERIALS_PATH } from "#src/services/genshinAssets/items/constants";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { EXCEL_DIRECTORY } from "#src/services/genshinText/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { EnemyDropFamilyDropTableMap, ForgeRecipeKind, readForgeRecipes, WALLET_ITEM_IDS } from "genshin-world";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The items every drop family's table names, every expedition's reward preview gives and every forge recipe takes or
// Yields, each read from the game's Material table with its name's text id, which `genshin:text names` writes into the
// Name-text chunks. The wallet's currencies are no items: Mora, Primogems and the rest are held by the wallet, and Adventure
// EXP is taken by the Adventure Rank, so none is written. A weapon a recipe yields is no item either, it is in the weapon
// Table. An item the table lacks is an error. Returns the file's path
export const writeItems = async (): Promise<string> => {
  const expeditionItemIds = readMondstadtExpeditionPlaces().flatMap(({ durations }) =>
    durations.flatMap(({ items }) => items.map(({ itemId }) => itemId)),
  );
  const forgeRecipes = await readForgeRecipes();
  const forgeItemIds = [
    ...forgeRecipes.flatMap(({ materials }) => materials.map(({ id }) => id)),
    ...forgeRecipes
      .filter(({ kind }) => kind !== ForgeRecipeKind.Weapon)
      .flatMap(({ results }) => results.map(({ itemId }) => itemId)),
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
    .filter((itemId) => !WALLET_ITEM_IDS.includes(itemId))
    .toSorted((firstId, secondId) => firstId - secondId);
  const items = itemIds.map((itemId) => {
    const materialRow = materialRows.find(({ id }) => id === itemId);
    if (!materialRow)
      throw new InvalidOperationError(Operation.Read, String(itemId), "has no row in the material table");
    return {
      id: materialRow.id,
      materialType: materialRow.materialType,
      nameTextId: String(materialRow.nameTextMapHash),
      rank: materialRow.rank,
      rarity: materialRow.rankLevel,
      stackLimit: materialRow.stackLimit,
    };
  });
  return writeWorldData(MATERIALS_PATH, items);
};
