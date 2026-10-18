import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { drawGcgCards } from "#src/services/gcg/drawGcgCards";
import { healGcgCharacter } from "#src/services/gcg/effects/healGcgCharacter";
import { takeOne } from "@esposter/shared";

export const VOURUKASHAS_GLOW_ID = 312_022;
const VOURUKASHAS_GLOW_HEAL = 1;
// Its once-per-Round effect, keyed by the id of the skill that gives it
const VOURUKASHAS_GLOW_TRIGGER_ID = 3_120_221;

// Vourukasha's Glow, an Artifact: after its character takes DMG and survives it, if she is active a card is drawn, and at this
// End Phase she heals 1 HP, once per Round. The heal waits in the counter
export const vourukashasGlow: GcgCardModule = {
  onDamageTaken: ({ characterIndex, duel, sideIndex }, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    if (side.usedCardIds.includes(VOURUKASHAS_GLOW_TRIGGER_ID)) return;
    side.usedCardIds.push(VOURUKASHAS_GLOW_TRIGGER_ID);
    if (characterIndex === side.activeIndex) drawGcgCards(side, 1, duel.rule.handCardLimit);
    zoneCard.counter = 1;
  },
  onEndPhase: ({ characterIndex, duel, sideIndex }, zoneCard) => {
    if (zoneCard.counter > 0 && characterIndex !== undefined) {
      zoneCard.counter = 0;
      const character = takeOne(duel.sides, sideIndex).characters.at(characterIndex);
      if (character) healGcgCharacter(character, VOURUKASHAS_GLOW_HEAL);
    }
    return undefined;
  },
};
