import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { healGcgCharacter } from "#src/services/gcg/effects/healGcgCharacter";
import { takeOne } from "@esposter/shared";

export const CEREMONIAL_GARMENT_ID = 112_052;
const CEREMONIAL_GARMENT_BONUS = 1;
const CEREMONIAL_GARMENT_HEAL = 1;
const CEREMONIAL_GARMENT_ROUNDS = 2;

// Ceremonial Garment, a status on Kokomi for two rounds: her Normal Attacks deal 1 more DMG, and after one every character
// Of hers is healed 1 HP
export const ceremonialGarment: GcgCardModule = {
  initialRounds: CEREMONIAL_GARMENT_ROUNDS,
  modifyDamageDealt: (context, damage) =>
    context.skill?.kind === GcgSkillKind.NormalAttack
      ? { ...damage, value: damage.value + CEREMONIAL_GARMENT_BONUS }
      : damage,
  onSkillUsed: ({ duel, sideIndex }, skill) => {
    if (skill.kind !== GcgSkillKind.NormalAttack) return;
    for (const character of takeOne(duel.sides, sideIndex).characters)
      healGcgCharacter(character, CEREMONIAL_GARMENT_HEAL);
  },
};
