import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgCost } from "#src/models/gcg/GcgCost";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { checkIsGcgPlayCost } from "#src/services/gcg/effects/checkIsGcgPlayCost";
import { drawRandomGcgCard } from "#src/services/gcg/effects/drawRandomGcgCard";
import { takeOne } from "@esposter/shared";

export const WAGNER_ID = 322_004;
const WAGNER_INITIAL_BILLETS = 2;
const WAGNER_WEAPON_KINDS_FOR_DRAW = 3;

// The Forging Billets a Weapon card's total cost takes
const getWeaponCost = (costs: GcgCost[]): number => costs.reduce((total, { count }) => total + count, 0);

// The number of different weapon kinds the side's deck originally includes, read from its cards' weapon kinds
const countDeckWeaponKinds = (side: GcgSideState): number =>
  new Set(
    side.deckCardIds.flatMap((cardId) => {
      const card = side.cards.find(({ id }) => id === cardId);
      return card?.kind === GcgCardKind.Weapon && card.weapon !== undefined ? [card.weapon] : [];
    }),
  ).size;

// Wagner, a support companion: comes with 2 Forging Billets and gains 1 at each End Phase. When played, if the deck
// originally includes at least 3 different weapon kinds, a random Weapon card is drawn from the deck. Playing a Weapon
// card spends Billets equal to its total cost and equips it for free, once per Round (the wiki's Wagner (Support Card))
export const wagner: GcgCardModule = {
  initialCounter: WAGNER_INITIAL_BILLETS,
  onCostPaid: ({ duel, sideIndex }, subject, zoneCard) => {
    if (!checkIsGcgPlayCost(subject)) return;
    zoneCard.counter -= getWeaponCost(subject.card.costs);
    takeOne(duel.sides, sideIndex).usedCardIds.push(WAGNER_ID);
  },
  onEndPhase: (_context, zoneCard) => {
    zoneCard.counter += 1;
    return undefined;
  },
  play: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    if (countDeckWeaponKinds(side) >= WAGNER_WEAPON_KINDS_FOR_DRAW)
      drawRandomGcgCard(side, GcgCardKind.Weapon, duel.random, duel.rule.handCardLimit);
  },
  reduceCost: ({ duel, sideIndex }, subject, zoneCard) => {
    if (!checkIsGcgPlayCost(subject) || subject.card.kind !== GcgCardKind.Weapon) return undefined;
    const cost = getWeaponCost(subject.card.costs);
    return zoneCard.counter >= cost && !takeOne(duel.sides, sideIndex).usedCardIds.includes(WAGNER_ID)
      ? { count: cost, element: undefined }
      : undefined;
  },
};
