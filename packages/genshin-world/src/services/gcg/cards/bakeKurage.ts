import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { healGcgCharacter } from "#src/services/gcg/effects/healGcgCharacter";
import { takeOne } from "@esposter/shared";

export const BAKE_KURAGE_ID = 112_051;
const BAKE_KURAGE_DAMAGE = 1;
const BAKE_KURAGE_HEAL = 1;
const BAKE_KURAGE_MAX_USAGES = 4;

// Bake-Kurage, a summon of two usages that stack up to four: at the End Phase it heals its side's active character 1 HP,
// Deals 1 Hydro DMG and spends a usage
export const bakeKurage: GcgCardModule = {
  initialUsages: 2,
  maxUsages: BAKE_KURAGE_MAX_USAGES,
  onEndPhase: ({ duel, sideIndex }, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    healGcgCharacter(takeOne(side.characters, side.activeIndex), BAKE_KURAGE_HEAL);
    zoneCard.usages -= 1;
    return { damageType: Element.Hydro, value: BAKE_KURAGE_DAMAGE };
  },
};
