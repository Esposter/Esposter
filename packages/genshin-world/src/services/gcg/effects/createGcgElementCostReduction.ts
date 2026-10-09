import type { Element } from "#src/models/Element";
import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgCostSubject } from "#src/models/gcg/GcgCostSubject";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";

import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { takeOne } from "@esposter/shared";

// A once-per-round reduction of one die of an element, spent by the first talent card played or skill used in a round that
// Costs such a die. Its card is marked as used in the round once the cost is paid
export const createGcgElementCostReduction = (
  cardId: number,
  element: Element,
): Pick<GcgCardModule, "onCostPaid" | "reduceCost"> => ({
  onCostPaid: (context: GcgEffectContext) => {
    takeOne(context.duel.sides, context.sideIndex).usedCardIds.push(cardId);
  },
  reduceCost: (context: GcgEffectContext, subject: GcgCostSubject) => {
    if (!checkIsGcgReductionDue(context, subject, cardId, element)) return undefined;
    return { count: 1, element };
  },
});

const checkIsGcgReductionDue = (
  context: GcgEffectContext,
  subject: GcgCostSubject,
  cardId: number,
  element: Element,
): boolean => {
  const side = takeOne(context.duel.sides, context.sideIndex);
  if (side.usedCardIds.includes(cardId)) return false;
  const isSkillOrTalent = subject.skill !== undefined || subject.card?.kind === GcgCardKind.Talent;
  const isOfElement = subject.costs.some(
    (cost) =>
      (cost.kind === GcgCostKind.Dice && cost.element === element) ||
      (cost.kind === GcgCostKind.Matching && subject.element === element),
  );
  return isSkillOrTalent && isOfElement;
};
