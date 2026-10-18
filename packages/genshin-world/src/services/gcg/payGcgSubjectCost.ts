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
import { surchargeGcgCosts } from "#src/services/gcg/effects/surchargeGcgCosts";
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
  for (const zoneCard of listGcgCostCards(side, characterIndex)) {
    const module = GcgCardIdModuleMap.get(zoneCard.cardId);
    const reduction = module?.reduceCost?.(
      getGcgCardContext(context, side, zoneCard),
      { ...subject, costs: reducedCosts, element: character.character.element },
      zoneCard,
    );
    if (!reduction) continue;
    reducedCosts = reduceGcgCosts(reducedCosts, reduction, character.character.element);
    appliedReductions.push(zoneCard);
  }
  // A card on the other side may surcharge the cost, in the dice it adds, and hears the payment only once it is paid
  const otherSideIndex = 1 - context.sideIndex;
  const surchargeCards: GcgZoneCard[] = [];
  for (const zoneCard of listGcgFieldCards(takeOne(context.duel.sides, otherSideIndex), undefined)) {
    const count = GcgCardIdModuleMap.get(zoneCard.cardId)?.surchargeCost?.(
      { duel: context.duel, sideIndex: otherSideIndex },
      { ...subject, costs: reducedCosts, element: character.character.element },
      zoneCard,
    );
    if (!count) continue;
    reducedCosts = surchargeGcgCosts(reducedCosts, count);
    surchargeCards.push(zoneCard);
  }
  if (!payGcgCost(side, character.character.element, reducedCosts, paidDiceIndices)) return false;
  character.energy -= energyCost;
  for (const zoneCard of appliedReductions) {
    const module = GcgCardIdModuleMap.get(zoneCard.cardId);
    module?.onCostPaid?.(
      getGcgCardContext(context, side, zoneCard),
      { ...subject, costs: reducedCosts, element: character.character.element },
      zoneCard,
    );
  }
  for (const zoneCard of surchargeCards)
    GcgCardIdModuleMap.get(zoneCard.cardId)?.onCostPaid?.(
      { duel: context.duel, sideIndex: otherSideIndex },
      { ...subject, costs: reducedCosts, element: character.character.element },
      zoneCard,
    );
  return true;
};

// The cards a cost's reductions are read from: the field of the character paying, then every other character's equipments
// And statuses, since a side-wide card reduces a cost whoever pays it (a switch's incoming character among them). A card that
// Reduces only its own holder's costs checks that the holder is the active character, the one paying
const listGcgCostCards = (side: GcgSideState, characterIndex: number): GcgZoneCard[] => [
  ...listGcgFieldCards(side, characterIndex),
  ...side.characters.flatMap((character, index) =>
    index === characterIndex ? [] : [...character.equipments, ...character.statuses],
  ),
];

// The context a card's reduction is read in, naming the character the card is attached to when it is one's
const getGcgCardContext = (context: GcgEffectContext, side: GcgSideState, zoneCard: GcgZoneCard): GcgEffectContext => ({
  ...context,
  characterIndex: findGcgZoneCardOwner(side.characters, zoneCard),
});
