import type { Element } from "#src/models/Element";
import type { GcgCost } from "#src/models/gcg/GcgCost";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import { isGcgIndexSelection } from "#src/services/gcg/isGcgIndexSelection";

// Pays a skill's or a card's dice costs from the dice chosen, which must be exactly the number the costs take: dice of an
// Element first, then Matching dice of the character's element, then Unaligned dice of any face, each taking an Omni die
// Once its own face runs out. Refused, and the dice left as they were, when the chosen dice do not cover the costs
export const payGcgCost = (
  side: GcgSideState,
  matchingElement: Element,
  costs: GcgCost[],
  paidDiceIndices: number[],
): boolean => {
  const requiredCount = costs.reduce(
    (total, cost) => (cost.kind === GcgCostKind.Energy ? total : total + cost.count),
    0,
  );
  if (paidDiceIndices.length !== requiredCount || !isGcgIndexSelection(paidDiceIndices, side.dice.length)) return false;
  const remainingFaces = side.dice.filter((_, index) => paidDiceIndices.includes(index));
  for (const cost of costs) {
    if (cost.kind !== GcgCostKind.Dice) continue;
    for (let paid = 0; paid < cost.count; paid++) if (!takeFace(remainingFaces, cost.element)) return false;
  }
  for (const cost of costs) {
    if (cost.kind !== GcgCostKind.Matching) continue;
    for (let paid = 0; paid < cost.count; paid++) if (!takeFace(remainingFaces, matchingElement)) return false;
  }
  for (const cost of costs) {
    if (cost.kind !== GcgCostKind.Unaligned) continue;
    for (let paid = 0; paid < cost.count; paid++) remainingFaces.shift();
  }
  side.dice = side.dice.filter((_, index) => !paidDiceIndices.includes(index));
  return true;
};

// Takes a face of the element from the faces left, or an Omni in its place, reporting whether one was there to take
const takeFace = (faces: (Element | GcgDieFace)[], element: Element): boolean => {
  const exactIndex = faces.indexOf(element);
  const takenIndex = exactIndex === -1 ? faces.indexOf(GcgDieFace.Omni) : exactIndex;
  if (takenIndex === -1) return false;
  faces.splice(takenIndex, 1);
  return true;
};
