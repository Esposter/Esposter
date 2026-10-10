import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { readMondstadtExpeditionPlaces } from "#src/services/genshinAssets/expeditions/readMondstadtExpeditionPlaces";
import { MATERIAL_TABLE_FILENAME } from "#src/services/genshinAssets/items/constants";
import { EXCEL_DIRECTORY } from "#src/services/genshinText/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import {
  craftingRecipeSchema,
  EnemyDropFamilyDropTableMap,
  ForgeRecipeKind,
  forgeRecipeSchema,
  GameDataset,
  WALLET_ITEM_IDS,
} from "genshin-world";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";

// The items every drop family's table names, every expedition's reward preview gives, and every forge and crafting recipe
// Takes or yields, each read from the game's Material table with its name's text id, which `genshin:text names` writes
// Into the name-text chunks. The wallet's currencies are no items: Mora, Primogems and the rest are held by the wallet, and Adventure
// EXP is taken by the Adventure Rank, so none is written. A weapon a recipe yields is no item either, it is in the weapon
// Table. The recipes are the records their steps published, read from the dev account. An item the table lacks is an
// Error. Returns the record the materials publish under
export const buildItems = async (): Promise<Record<string, unknown>> => {
  const expeditionItemIds = readMondstadtExpeditionPlaces().flatMap(({ durations }) =>
    durations.flatMap(({ items }) => items.map(({ itemId }) => itemId)),
  );
  const forgeRecipes = z.array(forgeRecipeSchema).parse(await readPublishedGameData("forging/recipes"));
  const forgeItemIds = [
    ...forgeRecipes.flatMap(({ materials }) => materials.map(({ id }) => id)),
    ...forgeRecipes
      .filter(({ kind }) => kind !== ForgeRecipeKind.Weapon)
      .flatMap(({ results }) => results.map(({ itemId }) => itemId)),
  ];
  const craftingRecipes = z.array(craftingRecipeSchema).parse(await readPublishedGameData("crafting/recipes"));
  const materialRows = parseMachineJson<MaterialRow[]>(
    await readFile(join(EXCEL_DIRECTORY, MATERIAL_TABLE_FILENAME), "utf8"),
  );
  const itemIds = [
    ...new Set([
      ...Object.values(EnemyDropFamilyDropTableMap).flatMap(({ materials }) => materials.map(({ itemId }) => itemId)),
      ...expeditionItemIds,
      ...forgeItemIds,
      ...craftingRecipes.flatMap(({ materials }) => materials.map(({ id }) => id)),
      ...craftingRecipes.map(({ resultItemId }) => resultItemId),
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
  return { [`${GameDataset.Items}/materials`]: items };
};
