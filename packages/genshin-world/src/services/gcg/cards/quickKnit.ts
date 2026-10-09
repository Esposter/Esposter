import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { takeOne } from "@esposter/shared";

// Quick Knit: one summon on the side gains one usage, the summon chosen by its place on the field
export const quickKnit: GcgCardModule = {
  canPlay: ({ duel, sideIndex }, targetIndex) =>
    targetIndex !== undefined && takeOne(duel.sides, sideIndex).summons.at(targetIndex) !== undefined,
  play: ({ duel, sideIndex }, targetIndex) => {
    const summon = targetIndex === undefined ? undefined : takeOne(duel.sides, sideIndex).summons.at(targetIndex);
    if (summon) summon.usages += 1;
  },
};
