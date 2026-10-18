import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgCostReduction } from "#src/models/gcg/GcgCostReduction";
import type { GcgCostSubject } from "#src/models/gcg/GcgCostSubject";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";

import { takeOne } from "@esposter/shared";

// A once-per-round reduction of a cost, which the given check sets for a subject. Its card is marked as used in the round once
// The cost is paid, and no reduction is due from it again in that round
export const createGcgOncePerRoundCostReduction = (
  cardId: number,
  getReduction: (context: GcgEffectContext, subject: GcgCostSubject) => GcgCostReduction | undefined,
): Pick<GcgCardModule, "onCostPaid" | "reduceCost"> => ({
  onCostPaid: (context) => {
    takeOne(context.duel.sides, context.sideIndex).usedCardIds.push(cardId);
  },
  reduceCost: (context, subject) => {
    if (takeOne(context.duel.sides, context.sideIndex).usedCardIds.includes(cardId)) return undefined;
    return getReduction(context, subject);
  },
});
