import { CookingTalentEffect } from "genshin-world";

// The effect each cooking talent's proud skill names, as the table spells it: a perfect cook's double, and the talent
// That adds a Suspicious dish
export const CookTalentEffectMap: Record<string, CookingTalentEffect> = {
  PROUD_EFFECT_COOK_PERFECT_MULTI_OUTPUT: CookingTalentEffect.DoubleProduct,
  PROUD_EFFECT_COOK_PROB_MULTI_OUTPUT: CookingTalentEffect.SuspiciousDish,
};
