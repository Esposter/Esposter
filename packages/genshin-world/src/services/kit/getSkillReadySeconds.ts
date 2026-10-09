import type { Kit } from "#src/models/kit/Kit";
import type { ElementalResonance } from "#src/models/party/ElementalResonance";

import { getImpetuousWindsSkillCooldownMultiplier } from "#src/services/party/getImpetuousWindsSkillCooldownMultiplier";

// The seconds before a kit's skill can be used again, from its party member's skill cooldown. That cooldown counts the
// Seconds until every charge is back, each use adding its own, so a charge stands to use once no more than the other
// Charges' cooldowns are left, each shortened by Impetuous Winds as a use's is, and a skill of one charge waits out the
// Whole of it
export const getSkillReadySeconds = (
  kit: Kit,
  elementalResonances: readonly ElementalResonance[],
  skillCooldownSeconds: number,
): number =>
  Math.max(
    0,
    skillCooldownSeconds -
      ((kit.elementalSkillCharges ?? 1) - 1) *
        kit.skillCooldownSeconds *
        getImpetuousWindsSkillCooldownMultiplier(elementalResonances),
  );
