import type { CookBonusRow } from "#src/models/genshinAssets/cooking/CookBonusRow";
import type { CookRecipeRow } from "#src/models/genshinAssets/cooking/CookRecipeRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";
import type { CookingRecipe, CookingSpecialty } from "genshin-world";

import { COOK_BONUS_REPLACE_TYPE, FoodQualityCookingQualityMap } from "#src/services/genshinAssets/cooking/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { CookingQuality } from "genshin-world";

// The quality a dish's result is, read off the food quality of its item row
const toResultQuality = (itemId: number, materialMap: Map<number, MaterialRow>): CookingQuality => {
  const foodQuality = materialMap.get(itemId)?.foodQuality;
  const quality = foodQuality === undefined ? undefined : FoodQualityCookingQualityMap[foodQuality];
  if (quality === undefined) throw new InvalidOperationError(Operation.Read, String(itemId), "is no dish's result");
  return quality;
};

// One dish from its cook recipe row: its ingredients, the item each quality of its result is, its proficiency, its zone
// Parameters, its rarity, its specialties, and the instructions that teach it. The results' qualities come from their
// Item rows, and each specialty's chances are read in the order of the results, as the table lists them
export const toCookingRecipe = (
  row: CookRecipeRow,
  {
    bonusRows,
    materialMap,
    unlockItemIds,
  }: { bonusRows: CookBonusRow[]; materialMap: Map<number, MaterialRow>; unlockItemIds: number[] },
): CookingRecipe => {
  const resultQualities = row.qualityOutputVec.map(({ id }) => toResultQuality(id, materialMap));
  const indexOfQuality = (quality: CookingQuality): number => resultQualities.indexOf(quality);
  const resultItemIdOf = (quality: CookingQuality): number => {
    const output = row.qualityOutputVec[indexOfQuality(quality)];
    if (!output) throw new InvalidOperationError(Operation.Read, String(row.id), `has no ${quality} result`);
    return output.id;
  };
  const specialties: CookingSpecialty[] = bonusRows
    .filter(({ bonusType, recipeId }) => recipeId === row.id && bonusType === COOK_BONUS_REPLACE_TYPE)
    .map(({ avatarId, complexParamVec, paramVec }) => {
      const specialItemId = paramVec[0];
      if (specialItemId === undefined)
        throw new InvalidOperationError(Operation.Read, String(row.id), "has no special dish");
      const chanceOf = (quality: CookingQuality): number => {
        const chance = complexParamVec[indexOfQuality(quality)];
        if (chance === undefined)
          throw new InvalidOperationError(Operation.Read, String(row.id), `has no ${quality} chance`);
        return chance;
      };
      return {
        avatarId,
        chances: {
          [CookingQuality.Delicious]: chanceOf(CookingQuality.Delicious),
          [CookingQuality.Regular]: chanceOf(CookingQuality.Regular),
          [CookingQuality.Suspicious]: chanceOf(CookingQuality.Suspicious),
        },
        itemId: specialItemId,
      };
    });
  const [qteCentre, qteWidth] = row.qteParam.split(",").map(Number);
  if (qteCentre === undefined || qteWidth === undefined)
    throw new InvalidOperationError(Operation.Read, String(row.id), "has no zone parameters");
  return {
    id: row.id,
    ingredients: row.inputVec.filter(({ count }) => count > 0).map(({ count, id }) => ({ count, id })),
    isDefaultUnlocked: row.isDefaultUnlocked,
    maxProficiency: row.maxProficiency,
    qteParam: [qteCentre, qteWidth],
    rankLevel: row.rankLevel,
    resultItemIds: {
      [CookingQuality.Delicious]: resultItemIdOf(CookingQuality.Delicious),
      [CookingQuality.Regular]: resultItemIdOf(CookingQuality.Regular),
      [CookingQuality.Suspicious]: resultItemIdOf(CookingQuality.Suspicious),
    },
    specialties,
    unlockItemIds,
  };
};
