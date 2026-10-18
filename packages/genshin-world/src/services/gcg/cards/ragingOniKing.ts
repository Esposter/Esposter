import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import {
  SUPERLATIVE_SUPERSTRENGTH_ID,
  superlativeSuperstrength,
} from "#src/services/gcg/cards/superlativeSuperstrength";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

export const RAGING_ONI_KING_ID = 116_053;
const RAGING_ONI_KING_BONUS = 1;
const RAGING_ONI_KING_ROUNDS = 2;

// Raging Oni King, a status on the character it is attached to for two rounds: her Normal Attacks deal 1 more DMG, her
// Physical DMG is converted to Geo DMG, and once a round, after a Normal Attack, she gains Superlative Superstrength
export const ragingOniKing: GcgCardModule = {
  initialRounds: RAGING_ONI_KING_ROUNDS,
  modifyDamageDealt: (context, damage) => {
    const converted = damage.damageType === GcgDamageKind.Physical ? { ...damage, damageType: Element.Geo } : damage;
    return context.skill?.kind === GcgSkillKind.NormalAttack
      ? { ...converted, value: converted.value + RAGING_ONI_KING_BONUS }
      : converted;
  },
  onSkillUsed: ({ characterIndex, duel, sideIndex }, skill, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    if (
      skill.kind !== GcgSkillKind.NormalAttack ||
      characterIndex === undefined ||
      side.usedCardIds.includes(zoneCard.cardId)
    )
      return;
    side.usedCardIds.push(zoneCard.cardId);
    placeGcgZoneCard(
      takeOne(side.characters, characterIndex).statuses,
      SUPERLATIVE_SUPERSTRENGTH_ID,
      superlativeSuperstrength,
    );
  },
};
