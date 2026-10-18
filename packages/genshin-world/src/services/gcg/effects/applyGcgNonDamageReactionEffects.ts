import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

import { GcgReactionKind } from "#src/models/gcg/GcgReactionKind";
import { burningFlame } from "#src/services/gcg/cards/burningFlame";
import { catalyzingField } from "#src/services/gcg/cards/catalyzingField";
import { dendroCore } from "#src/services/gcg/cards/dendroCore";
import {
  GCG_BURNING_FLAME_ID,
  GCG_BURNING_FLAME_MAX_USAGES,
  GCG_CATALYZING_FIELD_ID,
  GCG_CATALYZING_FIELD_MAX_USAGES,
  GCG_CRYSTALLIZE_SHIELD,
  GCG_DENDRO_CORE_ID,
  GCG_DENDRO_CORE_MAX_USAGES,
  GCG_SHIELD_LIMIT,
} from "#src/services/gcg/constants";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { findGcgAdjacentCharacterIndex } from "#src/services/gcg/findGcgAdjacentCharacterIndex";
import { takeOne } from "@esposter/shared";

// The effects a reaction leaves that deal no DMG: the Frozen status on the character it hits, the Shield its user's active
// Character gains, the forced switch of an Overloaded active character, and the card a Burning, Bloom or Quicken leaves on
// Its user's side. The side the reaction is made on is sourceSideIndex, and the one its character is on is targetSideIndex
export const applyGcgNonDamageReactionEffects = (
  duel: GcgDuel,
  sourceSideIndex: number,
  targetSideIndex: number,
  hit: GcgCharacterState,
  reaction: GcgReactionKind,
): void => {
  const sourceSide = takeOne(duel.sides, sourceSideIndex);
  const targetSide = takeOne(duel.sides, targetSideIndex);
  if (reaction === GcgReactionKind.Frozen) hit.isFrozen = true;
  else if (reaction === GcgReactionKind.Crystallize) {
    const user = sourceSide.characters.at(sourceSide.activeIndex);
    if (user) user.shield = Math.min(GCG_SHIELD_LIMIT, user.shield + GCG_CRYSTALLIZE_SHIELD);
  } else if (
    reaction === GcgReactionKind.Overloaded &&
    hit.hp > 0 &&
    targetSide.characters.at(targetSide.activeIndex) === hit
  ) {
    const nextIndex = findGcgAdjacentCharacterIndex(targetSide, targetSide.activeIndex, 1);
    if (nextIndex !== undefined) targetSide.activeIndex = nextIndex;
  } else if (reaction === GcgReactionKind.Burning)
    addGcgReactionCard(sourceSide.summons, GCG_BURNING_FLAME_ID, burningFlame, GCG_BURNING_FLAME_MAX_USAGES);
  else if (reaction === GcgReactionKind.Bloom)
    addGcgReactionCard(sourceSide.onstages, GCG_DENDRO_CORE_ID, dendroCore, GCG_DENDRO_CORE_MAX_USAGES);
  else if (reaction === GcgReactionKind.Quicken)
    addGcgReactionCard(sourceSide.onstages, GCG_CATALYZING_FIELD_ID, catalyzingField, GCG_CATALYZING_FIELD_MAX_USAGES);
};

// A reaction's card joins the field it is left on, or, when the field holds one already, gains the usages it starts with up
// To the most it holds
const addGcgReactionCard = (
  zoneCards: GcgZoneCard[],
  cardId: number,
  module: GcgCardModule,
  maxUsages: number,
): void => {
  const zoneCard = zoneCards.find((candidate) => candidate.cardId === cardId);
  if (zoneCard) zoneCard.usages = Math.min(maxUsages, zoneCard.usages + (module.initialUsages ?? 0));
  else zoneCards.push(createGcgZoneCard(cardId, module));
};
