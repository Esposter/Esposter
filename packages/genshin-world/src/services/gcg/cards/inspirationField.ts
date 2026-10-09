import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { healGcgCharacter } from "#src/services/gcg/effects/healGcgCharacter";
import { takeOne } from "@esposter/shared";

const INSPIRATION_FIELD_HP_THRESHOLD = 7;
const INSPIRATION_FIELD_BONUS = 2;
const INSPIRATION_FIELD_HEAL = 2;

// Inspiration Field: when its side's character uses a skill, a character at seven HP or more deals two more DMG, and one
// At six HP or fewer is healed for two once the skill's DMG is done, for two rounds
export const inspirationField: GcgCardModule = {
  initialRounds: 2,
  modifyDamageDealt: ({ duel, sideIndex }, damage) => {
    const character = takeOne(duel.sides, sideIndex).characters.at(takeOne(duel.sides, sideIndex).activeIndex);
    return character && character.hp >= INSPIRATION_FIELD_HP_THRESHOLD
      ? { ...damage, value: damage.value + INSPIRATION_FIELD_BONUS }
      : damage;
  },
  onSkillUsed: ({ duel, sideIndex }) => {
    const character = takeOne(duel.sides, sideIndex).characters.at(takeOne(duel.sides, sideIndex).activeIndex);
    if (character && character.hp < INSPIRATION_FIELD_HP_THRESHOLD) healGcgCharacter(character, INSPIRATION_FIELD_HEAL);
  },
};
