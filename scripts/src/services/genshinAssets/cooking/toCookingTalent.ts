import type { CookProudSkillRow } from "#src/models/genshinAssets/cooking/CookProudSkillRow";
import type { CookingTalent } from "genshin-world";

import { PERCENT_TOTAL } from "#src/services/genshinAssets/cooking/constants";
import { CookTalentEffectMap } from "#src/services/genshinAssets/cooking/CookTalentEffectMap";
import { CookTalentFoodTypeMap } from "#src/services/genshinAssets/cooking/CookTalentFoodTypeMap";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A cooking talent from its proud skill row: its chance in percent, the effect the row names, and the kinds of dish its
// Food type parameter lists, a comma separated list of their numbers. An unknown effect or number throws
export const toCookingTalent = ({
  lifeEffectParams,
  lifeEffectType,
  proudSkillGroupId,
}: CookProudSkillRow): CookingTalent => {
  const [chanceParam, foodTypeParam] = lifeEffectParams;
  const effect = lifeEffectType === undefined ? undefined : CookTalentEffectMap[lifeEffectType];
  if (effect === undefined)
    throw new InvalidOperationError(Operation.Read, String(proudSkillGroupId), "is no cooking talent");
  if (chanceParam === undefined || foodTypeParam === undefined)
    throw new InvalidOperationError(Operation.Read, String(proudSkillGroupId), "has no chance or food type");
  const foodTypes = foodTypeParam.split(",").map((code) => {
    const foodType = CookTalentFoodTypeMap[code];
    if (foodType === undefined)
      throw new InvalidOperationError(Operation.Read, String(proudSkillGroupId), `names no food type ${code}`);
    return foodType;
  });
  return { chance: Number(chanceParam) / PERCENT_TOTAL, effect, foodTypes };
};
