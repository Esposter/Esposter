import type { GcgDamage } from "#src/models/gcg/GcgDamage";
import type { GcgDealtDamage } from "#src/models/gcg/GcgDealtDamage";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";

import { applyGcgDamage } from "#src/services/gcg/applyGcgDamage";
import { modifyGcgDamageDealt } from "#src/services/gcg/effects/modifyGcgDamageDealt";

// A skill's damage to the opposing active character, after its user's field has borne on it. A Swirl the hit triggers
// spreads through the same context, so the field bears on the spread too
export const dealGcgSkillDamage = (context: GcgEffectContext, damage: GcgDamage): GcgDealtDamage[] =>
  applyGcgDamage(context.duel, context.sideIndex, modifyGcgDamageDealt(context, damage), context.duel.rule, context);
