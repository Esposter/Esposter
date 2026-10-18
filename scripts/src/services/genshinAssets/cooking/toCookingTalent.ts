import type { CookProudSkillRow } from "#src/models/genshinAssets/cooking/CookProudSkillRow";
import type { CookingTalent } from "genshin-world";

import { CookTalentEffectMap } from "#src/services/genshinAssets/cooking/CookTalentEffectMap";
import { CookTalentFoodTypeMap } from "#src/services/genshinAssets/cooking/CookTalentFoodTypeMap";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The table writes a cooking talent's chance in hundredths of a percent
const COOK_TALENT_CHANCE_SCALE = 100;

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
  return { chance: Number(chanceParam) / COOK_TALENT_CHANCE_SCALE, effect, foodTypes };
};
