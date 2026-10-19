import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { createGcgActiveCharacterSwitch } from "#src/services/gcg/createGcgActiveCharacterSwitch";

import { GcgReactionKind } from "#src/models/gcg/GcgReactionKind";
import { burningFlame } from "#src/services/gcg/cards/burningFlame";
import { catalyzingField } from "#src/services/gcg/cards/catalyzingField";
import { dendroCore } from "#src/services/gcg/cards/dendroCore";
import {
  GCG_BURNING_FLAME_ID,
  GCG_CATALYZING_FIELD_ID,
  GCG_CRYSTALLIZE_SHIELD,
  GCG_DENDRO_CORE_ID,
} from "#src/services/gcg/constants";
import { addGcgShield } from "#src/services/gcg/effects/addGcgShield";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { findGcgAdjacentCharacterIndex } from "#src/services/gcg/findGcgAdjacentCharacterIndex";
import { takeOne } from "@esposter/shared";

// The effects a reaction leaves that deal no DMG: the Frozen status on the character it hits, the Shield its user's active
// Character gains, the forced switch of an Overloaded active character, and the card a Burning, Bloom or Quicken leaves on
// Its user's side. The side the reaction is made on is sourceSideIndex, and the one its character is on is targetSideIndex.
// The forced switch is switchActiveCharacter, handed in by the caller, since a switch's hooks can deal damage in turn
export const applyGcgNonDamageReactionEffects = (
  duel: GcgDuel,
  sourceSideIndex: number,
  targetSideIndex: number,
  hit: GcgCharacterState,
  reaction: GcgReactionKind,
  switchActiveCharacter: ReturnType<typeof createGcgActiveCharacterSwitch>,
): void => {
  const sourceSide = takeOne(duel.sides, sourceSideIndex);
  const targetSide = takeOne(duel.sides, targetSideIndex);
  if (reaction === GcgReactionKind.Frozen) hit.isFrozen = true;
  else if (reaction === GcgReactionKind.Crystallize) {
    const user = sourceSide.characters.at(sourceSide.activeIndex);
    if (user) addGcgShield(user, GCG_CRYSTALLIZE_SHIELD);
  } else if (
    reaction === GcgReactionKind.Overloaded &&
    hit.hp > 0 &&
    targetSide.characters.at(targetSide.activeIndex) === hit
  ) {
    const nextIndex = findGcgAdjacentCharacterIndex(targetSide, targetSide.activeIndex, 1);
    if (nextIndex !== undefined) switchActiveCharacter(duel, targetSideIndex, nextIndex);
  } else if (reaction === GcgReactionKind.Burning)
    placeGcgZoneCard(sourceSide.summons, GCG_BURNING_FLAME_ID, burningFlame);
  else if (reaction === GcgReactionKind.Bloom) placeGcgZoneCard(sourceSide.onstages, GCG_DENDRO_CORE_ID, dendroCore);
  else if (reaction === GcgReactionKind.Quicken)
    placeGcgZoneCard(sourceSide.onstages, GCG_CATALYZING_FIELD_ID, catalyzingField);
};
