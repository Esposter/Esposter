import type { Element } from "#src/models/Element";
import type { GcgReactionKind } from "#src/models/gcg/GcgReactionKind";
import type { GcgRule } from "#src/models/gcg/GcgRule";

import { GcgReactionPairs } from "#src/services/gcg/constants";

// The reaction two elements make under a rule, when the rule lists the pair in either order, or nothing when it does not
export const getGcgReactionKind = (
  rule: GcgRule,
  firstElement: Element,
  secondElement: Element,
): GcgReactionKind | undefined => {
  if (!rule.reactions.some(({ elements }) => isSamePair(elements, firstElement, secondElement))) return undefined;
  return GcgReactionPairs.find(([pairFirst, pairSecond]) =>
    isSamePair([pairFirst, pairSecond], firstElement, secondElement),
  )?.[2];
};

const isSamePair = (pair: [Element, Element], firstElement: Element, secondElement: Element): boolean =>
  (pair[0] === firstElement && pair[1] === secondElement) || (pair[0] === secondElement && pair[1] === firstElement);
