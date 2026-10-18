import type { GcgCost } from "#src/models/gcg/GcgCost";
import type { GcgCostSubject } from "#src/models/gcg/GcgCostSubject";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { findGcgZoneCardOwner } from "#src/services/gcg/effects/findGcgZoneCardOwner";
import { listGcgFieldCards } from "#src/services/gcg/effects/listGcgFieldCards";
import { reduceGcgCosts } from "#src/services/gcg/effects/reduceGcgCosts";
import { payGcgCost } from "#src/services/gcg/payGcgCost";
import { takeOne } from "@esposter/shared";

// Pays the costs of a skill a character uses or a card played: the field's reductions are taken off the costs first, in
// The order the field lists them, then the dice chosen pay what is left and the energy the skill's own costs name is spent.
// A refused payment leaves the dice and energy as they were, and a paid one tells each reduction that applied
export const payGcgSubjectCost = (
  context: GcgEffectContext,
  characterIndex: number,
  subject: Pick<GcgCostSubject, "card" | "skill" | "switchTo">,
  costs: GcgCost[],
  paidDiceIndices: number[],
): boolean => {
  const side: GcgSideState = takeOne(context.duel.sides, context.sideIndex);
  const character = side.characters.at(characterIndex);
  if (!character) return false;
  const energyCost = costs.reduce((total, cost) => (cost.kind === GcgCostKind.Energy ? total + cost.count : total), 0);
  if (character.energy < energyCost) return false;
  let reducedCosts = costs;
  const appliedReductions: GcgZoneCard[] = [];
  for (const zoneCard of listGcgCostCards(side, characterIndex, subject.switchTo)) {
    const module = GcgCardIdModuleMap.get(zoneCard.cardId);
    const reduction = module?.reduceCost?.(
      listGcgCardContext(context, side, zoneCard),
      { ...subject, costs: reducedCosts, element: character.character.element },
      zoneCard,
    );
    if (!reduction) continue;
    reducedCosts = reduceGcgCosts(reducedCosts, reduction, character.character.element);
    appliedReductions.push(zoneCard);
  }
  if (!payGcgCost(side, character.character.element, reducedCosts, paidDiceIndices)) return false;
  character.energy -= energyCost;
  for (const zoneCard of appliedReductions) {
    const module = GcgCardIdModuleMap.get(zoneCard.cardId);
    module?.onCostPaid?.(
      listGcgCardContext(context, side, zoneCard),
      { ...subject, costs: reducedCosts, element: character.character.element },
      zoneCard,
    );
  }
  return true;
};

// The cards a cost's reductions are read from: the field of the character paying, and for a switch, the cards attached to
// The character it brings in
const listGcgCostCards = (side: GcgSideState, characterIndex: number, switchTo: number | undefined): GcgZoneCard[] => {
  const incoming = switchTo === undefined ? undefined : side.characters.at(switchTo);
  return [
    ...listGcgFieldCards(side, characterIndex),
    ...(incoming ? [...incoming.equipments, ...incoming.statuses] : []),
  ];
};

// The context a card's reduction is read in, naming the character the card is attached to when it is one's
const listGcgCardContext = (
  context: GcgEffectContext,
  side: GcgSideState,
  zoneCard: GcgZoneCard,
): GcgEffectContext => ({ ...context, characterIndex: findGcgZoneCardOwner(side.characters, zoneCard) });
