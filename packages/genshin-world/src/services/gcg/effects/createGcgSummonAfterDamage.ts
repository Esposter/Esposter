import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

// A skill that summons places its summon on its side's field once its damage is dealt, or refreshes it if it is already there
export const createGcgSummonAfterDamage =
  (cardId: number, summon: GcgCardModule): NonNullable<GcgSkillModule["afterDamage"]> =>
  ({ duel, sideIndex }) => {
    placeGcgZoneCard(takeOne(duel.sides, sideIndex).summons, cardId, summon);
  };
