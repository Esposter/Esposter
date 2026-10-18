import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { createGcgElementCostReduction } from "#src/services/gcg/effects/createGcgElementCostReduction";

const SWEEPING_TIME_ID = 116_022;
const SWEEPING_TIME_BONUS = 2;
const SWEEPING_TIME_ROUNDS = 2;

// Sweeping Time, a status on the character it is attached to, for two rounds: its Normal Attacks deal 2 more DMG, its
// Physical DMG is converted to Geo DMG, and once a round its Normal Attack spends one Geo die less
export const sweepingTime: GcgCardModule = {
  ...createGcgElementCostReduction(SWEEPING_TIME_ID, Element.Geo, GcgSkillKind.NormalAttack),
  initialRounds: SWEEPING_TIME_ROUNDS,
  modifyDamageDealt: (context, damage) => {
    const converted = damage.damageType === GcgDamageKind.Physical ? { ...damage, damageType: Element.Geo } : damage;
    return context.skill?.kind === GcgSkillKind.NormalAttack
      ? { ...converted, value: converted.value + SWEEPING_TIME_BONUS }
      : converted;
  },
};
