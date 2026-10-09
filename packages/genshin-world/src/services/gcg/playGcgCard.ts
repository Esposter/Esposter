import type { GcgCard } from "#src/models/gcg/GcgCard";
import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { checkGcgActingSide } from "#src/services/gcg/checkGcgActingSide";
import { GCG_SUPPORT_LIMIT } from "#src/services/gcg/constants";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { payGcgSubjectCost } from "#src/services/gcg/payGcgSubjectCost";
import { pruneGcgZoneCards } from "#src/services/gcg/pruneGcgZoneCards";
import { runGcgSkillUse } from "#src/services/gcg/runGcgSkillUse";
import { takeOne } from "@esposter/shared";

// A fast action: the card at a hand index is played. A support takes its place in the support zone, equipment is equipped
// To the target character, and an event is played and gone. The card's own module then takes its effect. Refused, and the
// Duel left as it was, when the card has no module, its target or zone is not one it may take, or its cost is not covered
export const playGcgCard = (
  duel: GcgDuel,
  sideIndex: number,
  handIndex: number,
  targetIndex: number | undefined,
  paidDiceIndices: number[],
): GcgActionResult => {
  const refusal = checkGcgActingSide(duel, sideIndex);
  if (refusal !== undefined) return refusal;
  const side = takeOne(duel.sides, sideIndex);
  const cardId = side.hand.at(handIndex);
  const card = side.cards.find(({ id }) => id === cardId);
  const module = card && GcgCardIdModuleMap.get(card.id);
  if (!card || !module || !checkCanPlaceGcgCard(side, card, targetIndex)) return GcgActionResult.Unavailable;
  const context: GcgEffectContext = { duel, sideIndex };
  if (module.canPlay && !module.canPlay(context, targetIndex)) return GcgActionResult.Unavailable;
  if (!payGcgSubjectCost(context, side.activeIndex, { card, skill: undefined }, card.costs, paidDiceIndices))
    return GcgActionResult.Unpayable;
  side.hand = side.hand.filter((_cardId, index) => index !== handIndex);
  placeGcgCard(side, card, targetIndex, module);
  module.play?.(context, targetIndex);
  const skill = module.skillOnPlay?.(context, targetIndex);
  if (skill) runGcgSkillUse(context, skill);
  for (const sideState of duel.sides) pruneGcgZoneCards(sideState);
  return GcgActionResult.Done;
};

// Whether a card's zone has room for it and its target takes it: a support zone of its size, one card of each equipment
// Kind a character holds, and a target for equipment alone
const checkCanPlaceGcgCard = (side: GcgSideState, card: GcgCard, targetIndex: number | undefined): boolean => {
  if (card.kind === GcgCardKind.Support) return side.supports.length < GCG_SUPPORT_LIMIT;
  if (!checkIsGcgEquipment(card)) return true;
  const target = targetIndex === undefined ? undefined : side.characters.at(targetIndex);
  return (
    target !== undefined &&
    !target.equipments.some((zoneCard) => side.cards.find(({ id }) => id === zoneCard.cardId)?.kind === card.kind)
  );
};

const checkIsGcgEquipment = (card: GcgCard): boolean =>
  card.kind === GcgCardKind.Artifact || card.kind === GcgCardKind.Talent || card.kind === GcgCardKind.Weapon;

// Puts a played card where its kind keeps it: a support in the support zone, equipment on the target, an event nowhere
const placeGcgCard = (
  side: GcgSideState,
  card: GcgCard,
  targetIndex: number | undefined,
  module: GcgCardModule,
): void => {
  if (card.kind === GcgCardKind.Support) side.supports.push(createGcgZoneCard(card.id, module));
  else if (checkIsGcgEquipment(card) && targetIndex !== undefined)
    takeOne(side.characters, targetIndex).equipments.push(createGcgZoneCard(card.id, module));
};
