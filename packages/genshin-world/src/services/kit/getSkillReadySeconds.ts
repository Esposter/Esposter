import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";

import { getImpetuousWindsSkillCooldownMultiplier } from "#src/services/party/getImpetuousWindsSkillCooldownMultiplier";

// The seconds before a kit's skill can be used again, from its party member's skill cooldown. That cooldown counts the
// Seconds until every charge is back, each use adding its own, so a charge stands to use once no more than the other
// Charges' cooldowns are left, each shortened by Impetuous Winds as a use's is, and a skill of one charge waits out the
// Whole of it
export const getSkillReadySeconds = (kit: Kit, combatant: Combatant, skillCooldownSeconds: number): number => {
  const charges = (kit.elementalSkillCharges ?? 1) + (kit.getSkillChargeBonus?.(combatant) ?? 0);
  return Math.max(
    0,
    skillCooldownSeconds -
      (charges - 1) *
        kit.skillCooldownSeconds *
        getImpetuousWindsSkillCooldownMultiplier(combatant.elementalResonances),
  );
};
