import type { MaterialRow } from "#src/models/genshinAssets/shared/MaterialRow";
import type { CookingQuality } from "genshin-world";

import { FoodQualityCookingQualityMap } from "#src/services/genshinAssets/cooking/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The quality a dish's result is, read off the food quality of its item row
export const toResultQuality = (itemId: number, materialMap: Map<number, MaterialRow>): CookingQuality => {
  const foodQuality = materialMap.get(itemId)?.foodQuality;
  const quality = foodQuality === undefined ? undefined : FoodQualityCookingQualityMap[foodQuality];
  if (quality === undefined) throw new InvalidOperationError(Operation.Read, String(itemId), "is no dish's result");
  return quality;
};
