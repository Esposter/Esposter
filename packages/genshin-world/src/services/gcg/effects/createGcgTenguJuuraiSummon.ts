import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { applyGcgCrowfeatherCover } from "#src/services/gcg/cards/crowfeatherCover";
import { createGcgEndPhaseDamageSummon } from "#src/services/gcg/effects/createGcgEndPhaseDamageSummon";
import { takeOne } from "@esposter/shared";

// A Tengu Juurai summon of Kujou Sara's: End Phase DMG of Electro, and Crowfeather Cover to her side's active character. It is
// Spent after its usages
export const createGcgTenguJuuraiSummon = ({ damage, usages }: { damage: number; usages: number }): GcgCardModule =>
  createGcgEndPhaseDamageSummon({
    damage,
    damageType: Element.Electro,
    onEndPhase: ({ duel, sideIndex }) => {
      applyGcgCrowfeatherCover(takeOne(duel.sides, sideIndex));
    },
    usages,
  });
