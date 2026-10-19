import type { Element } from "#src/models/Element";
import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgCostSubject } from "#src/models/gcg/GcgCostSubject";

import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import type { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { createGcgOncePerRoundCostReduction } from "#src/services/gcg/effects/createGcgOncePerRoundCostReduction";

// A once-per-round reduction of one die of an element, spent by the first talent card played or skill used in a round that
// Costs such a die, or, given a skill kind, by the first skill of that kind alone
export const createGcgElementCostReduction = (
  cardId: number,
  element: Element,
  skillKind?: GcgSkillKind,
): Pick<GcgCardModule, "onCostPaid" | "reduceCost"> =>
  createGcgOncePerRoundCostReduction(cardId, (_context, subject) =>
    checkIsGcgReductionDue(subject, element, skillKind) ? { count: 1, element } : undefined,
  );

const checkIsGcgReductionDue = (
  subject: GcgCostSubject,
  element: Element,
  skillKind: GcgSkillKind | undefined,
): boolean => {
  const isSkillOrTalent =
    skillKind === undefined
      ? subject.skill !== undefined || subject.card?.kind === GcgCardKind.Talent
      : subject.skill?.kind === skillKind;
  const isOfElement = subject.costs.some(
    (cost) =>
      (cost.kind === GcgCostKind.Dice && cost.element === element) ||
      (cost.kind === GcgCostKind.Matching && subject.element === element),
  );
  return isSkillOrTalent && isOfElement;
};
