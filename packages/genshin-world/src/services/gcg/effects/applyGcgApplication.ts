import type { Element } from "#src/models/Element";
import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GcgAura } from "#src/models/gcg/GcgAura";
import { GCG_AURA_ELEMENTS } from "#src/services/gcg/constants";
import { applyGcgNonDamageReactionEffects } from "#src/services/gcg/effects/applyGcgNonDamageReactionEffects";
import { getGcgReactionKind } from "#src/services/gcg/getGcgReactionKind";

// An element applied to a character with no damage, by a card's effect on the side at sideIndex. A character holding no aura
// Takes the element as its aura when an aura takes it. One holding an aura reacts with the element when the rule lists the
// Pair: the aura is spent and the reaction's effects that deal no DMG land, since a non-DMG application's DMG-dealing effects
// Are ignored (the wiki's Elemental Reaction Rules). An element the aura makes no reaction with leaves the aura standing
export const applyGcgApplication = (
  duel: GcgDuel,
  sideIndex: number,
  character: GcgCharacterState,
  element: Element,
): void => {
  const aura = character.aura;
  if (aura === GcgAura.None) {
    if (GCG_AURA_ELEMENTS.includes(element)) character.aura = element;
    return;
  }
  const reaction = getGcgReactionKind(duel.rule, aura, element);
  if (reaction === undefined) return;
  character.aura = GcgAura.None;
  applyGcgNonDamageReactionEffects(duel, sideIndex, sideIndex, character, reaction);
};
