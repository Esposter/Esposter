import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { checkIsGcgActiveHolder } from "#src/services/gcg/effects/checkIsGcgActiveHolder";
import { takeOne } from "@esposter/shared";
import { CAPRICIOUS_VISAGE_ID } from "#src/services/gcg/cards/constants";

// Capricious Visage: once a round, a talent card played or an elemental skill used spends one Elemental Die less. The reduction
// Takes off a Dice line alone, so the Unaligned line of a normal attack or event is left as it is
export const capriciousVisage: GcgCardModule = {
  onCostPaid: ({ duel, sideIndex }) => {
    takeOne(duel.sides, sideIndex).usedCardIds.push(CAPRICIOUS_VISAGE_ID);
  },
  reduceCost: (context, subject) => {
    if (!checkIsGcgActiveHolder(context)) return undefined;
    if (takeOne(context.duel.sides, context.sideIndex).usedCardIds.includes(CAPRICIOUS_VISAGE_ID)) return undefined;
    const isTalentOrElementalSkill =
      subject.card?.kind === GcgCardKind.Talent || subject.skill?.kind === GcgSkillKind.ElementalSkill;
    if (!isTalentOrElementalSkill || !subject.costs.some((cost) => cost.kind === GcgCostKind.Dice)) return undefined;
    return { count: 1, kind: GcgCostKind.Dice };
  },
};
