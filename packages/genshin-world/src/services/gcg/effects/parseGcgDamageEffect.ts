import type { GcgDamage } from "#src/models/gcg/GcgDamage";

import { GCG_EFFECT_DAMAGE_REGEX, GcgEffectDamageNameMap } from "#src/services/gcg/constants";

// The damage a shared effect name deals, such as Effect_Damage_Fire_3 for three Pyro, or nothing when the name is not one
// Of the shared damage effects
export const parseGcgDamageEffect = (effect: string): GcgDamage | undefined => {
  const groups = GCG_EFFECT_DAMAGE_REGEX.exec(effect)?.groups;
  const damageType = groups?.element === undefined ? undefined : GcgEffectDamageNameMap.get(groups.element);
  return damageType === undefined || groups?.count === undefined
    ? undefined
    : { damageType, value: Number(groups.count) };
};
