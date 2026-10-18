import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { takeOne } from "@esposter/shared";

export const CHINJU_FOREST_ID = 321_012;

// Chinju Forest, a support: while the side's Elemental Dice are an even number, its character's Normal Attacks cost 1 fewer
// Unaligned die, and each reduction spends one of its four usages (the wiki's Chinju Forest)
export const chinjuForest: GcgCardModule = {
  initialUsages: 4,
  onCostPaid: (_context, _subject, zoneCard) => {
    zoneCard.usages -= 1;
  },
  reduceCost: (context, subject) =>
    subject.skill?.kind === GcgSkillKind.NormalAttack &&
    takeOne(context.duel.sides, context.sideIndex).dice.length % 2 === 0
      ? { count: 1, kind: GcgCostKind.Unaligned }
      : undefined,
};
