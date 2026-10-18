import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { checkIsGcgActiveHolder } from "#src/services/gcg/effects/checkIsGcgActiveHolder";
import { createGcgElementCostReduction } from "#src/services/gcg/effects/createGcgElementCostReduction";
import { SWEEPING_TIME_ID } from "#src/services/gcg/cards/constants";

const SWEEPING_TIME_BONUS = 2;
const SWEEPING_TIME_ROUNDS = 2;

const sweepingTimeReduction = createGcgElementCostReduction(SWEEPING_TIME_ID, Element.Geo, GcgSkillKind.NormalAttack);

// Sweeping Time, a status on the character it is attached to, for two rounds: its Normal Attacks deal 2 more DMG, its
// Physical DMG is converted to Geo DMG, and once a round its Normal Attack spends one Geo die less. The reduction is the
// Holder's alone, since the cost reductions of the field are read for every character's cost, a standby holder's included
export const sweepingTime: GcgCardModule = {
  ...sweepingTimeReduction,
  initialRounds: SWEEPING_TIME_ROUNDS,
  modifyDamageDealt: (context, damage) => {
    const converted = damage.damageType === GcgDamageKind.Physical ? { ...damage, damageType: Element.Geo } : damage;
    return context.skill?.kind === GcgSkillKind.NormalAttack
      ? { ...converted, value: converted.value + SWEEPING_TIME_BONUS }
      : converted;
  },
  reduceCost: (context, subject, zoneCard) =>
    checkIsGcgActiveHolder(context) ? sweepingTimeReduction.reduceCost?.(context, subject, zoneCard) : undefined,
};
