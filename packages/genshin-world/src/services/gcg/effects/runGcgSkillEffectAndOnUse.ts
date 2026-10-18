import type { GcgDamage } from "#src/models/gcg/GcgDamage";
import type { GcgDealtDamage } from "#src/models/gcg/GcgDealtDamage";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { listGcgFieldCards } from "#src/services/gcg/effects/listGcgFieldCards";
import { runGcgOnSkillUsed } from "#src/services/gcg/effects/runGcgOnSkillUsed";
import { runGcgSkillEffect } from "#src/services/gcg/effects/runGcgSkillEffect";
import { takeOne } from "@esposter/shared";

// A skill's effect as it lands, then the on-use hooks of the cards on its character's field. The field is read
// Before the effect runs, so a card the skill creates hears the next skill, not its own
export const runGcgSkillEffectAndOnUse = (
  context: GcgEffectContext,
  characterIndex: number | undefined,
  skill: GcgSkill,
  damage: GcgDamage | undefined,
): GcgDealtDamage[] => {
  const fieldCards = listGcgFieldCards(takeOne(context.duel.sides, context.sideIndex), characterIndex);
  const dealt = runGcgSkillEffect(context, skill, damage);
  runGcgOnSkillUsed(context, fieldCards, skill, dealt);
  return dealt;
};
