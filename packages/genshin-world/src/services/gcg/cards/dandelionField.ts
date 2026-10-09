import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { healGcgCharacter } from "#src/services/gcg/effects/healGcgCharacter";
import { takeOne } from "@esposter/shared";

const DANDELION_FIELD_DAMAGE = 1;
const DANDELION_FIELD_HEAL = 1;

// Dandelion Field, which Dandelion Breeze summons: at the end phase, 1 Anemo DMG and 1 HP healed to the active character, for
// Three usages
export const dandelionField: GcgCardModule = {
  initialUsages: 3,
  onEndPhase: ({ duel, sideIndex }, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    const active = side.characters.at(side.activeIndex);
    if (active) healGcgCharacter(active, DANDELION_FIELD_HEAL);
    zoneCard.usages -= 1;
    return { damageType: Element.Anemo, value: DANDELION_FIELD_DAMAGE };
  },
};
