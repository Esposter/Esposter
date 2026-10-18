import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { readMondstadtExpeditionPlaces } from "#src/services/genshinAssets/expeditions/readMondstadtExpeditionPlaces";
import { MATERIAL_TYPE_NONE } from "#src/services/genshinAssets/gathering/constants";
import { readCookingRecipes } from "#src/services/genshinAssets/cooking/readCookingRecipes";
import { MATERIAL_TABLE_NAME } from "#src/services/genshinAssets/items/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import {
  craftingRecipeSchema,
  EnemyDropFamilyDropTableMap,
  ForgeRecipeKind,
  forgeRecipeSchema,
  gadgetRowSchema,
  GameDataset,
  offeringLevelSchema,
  reputationCitySchema,
  WALLET_ITEM_IDS,
} from "genshin-world";
import { z } from "zod";

// The items every drop family's table names, every expedition's reward preview gives, every forge and crafting recipe
// Takes or yields, every dish a cook recipe yields, every gadget of the gadgets slice, every offering the Frostbearing
// Tree's levels take or pay, every item a Reputation level pays, and every item the Mondstadt grocery sells, each read
// From the game's material table with its name's text id, which `genshin:text names` writes into the name-text chunks.
// The wallet's currencies are no items: Mora, Primogems and the rest are held by the wallet, and Adventure EXP is taken
// By the Adventure Rank, so none is written. A weapon a recipe yields is no item either, it is in the weapon table. The
// Recipes and the levels are the records their steps published, read from the dev account. An item the table lacks is
// An error. An item the table gives no type is left out, as the dump leaves out MATERIAL_NONE and the gathering reader
// Leaves such an item out. Returns the record the materials publish under
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
  const gadgetRows = z.array(gadgetRowSchema).parse(await readPublishedGameData("gadgets/gadgets"));
  const craftingRecipes = z.array(craftingRecipeSchema).parse(await readPublishedGameData("crafting/recipes"));
  const frostbearingTreeLevels = z
    .array(offeringLevelSchema)
    .parse(await readPublishedGameData("offerings/frostbearingTree"));
  const { levels: reputationLevels } = reputationCitySchema.parse(await readPublishedGameData("reputation/mondstadt"));
  const groceryGoods = z
    .array(z.object({ itemId: z.int() }))
    .parse(await readPublishedGameData("shops/mondstadtGeneralGoods"));
  const materialRows = readExcelTable<MaterialRow>(MATERIAL_TABLE_NAME);
  const itemIds = [
    ...new Set([
      ...Object.values(EnemyDropFamilyDropTableMap).flatMap(({ materials }) => materials.map(({ itemId }) => itemId)),
      ...readCookingRecipes().flatMap(({ resultItemIds }) => Object.values(resultItemIds)),
      ...expeditionItemIds,
      ...forgeItemIds,
      ...gadgetRows.map(({ id }) => id),
      ...craftingRecipes.flatMap(({ materials }) => materials.map(({ id }) => id)),
      ...craftingRecipes.map(({ resultItemId }) => resultItemId),
      ...frostbearingTreeLevels.filter(({ itemCount }) => itemCount > 0).map(({ itemId }) => itemId),
      ...frostbearingTreeLevels.flatMap(({ rewards }) => rewards.map(({ itemId }) => itemId)),
      ...reputationLevels.flatMap(({ reward }) => reward.items.map(({ id }) => id)),
      ...groceryGoods.map(({ itemId }) => itemId),
    ]),
  ]
    .filter((itemId) => !WALLET_ITEM_IDS.includes(itemId))
    .toSorted((firstId, secondId) => firstId - secondId);
  const items = itemIds.flatMap((itemId) => {
    const materialRow = materialRows.find(({ id }) => id === itemId);
    if (!materialRow)
      throw new InvalidOperationError(Operation.Read, String(itemId), "has no row in the material table");
    const { materialType = MATERIAL_TYPE_NONE } = materialRow;
    if (materialType === MATERIAL_TYPE_NONE) return [];
    return [
      {
        id: materialRow.id,
        materialType,
        nameTextId: String(materialRow.nameTextMapHash),
        rank: materialRow.rank,
        rarity: materialRow.rankLevel,
        stackLimit: materialRow.stackLimit,
      },
    ];
  });
  return { [`${GameDataset.Items}/materials`]: items };
};
