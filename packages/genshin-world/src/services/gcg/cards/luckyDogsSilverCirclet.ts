import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { healGcgCharacter } from "#src/services/gcg/effects/healGcgCharacter";
import { takeOne } from "@esposter/shared";

const LUCKY_DOGS_SILVER_CIRCLET_ID = 312_002;
const HEAL_VALUE = 2;

// Lucky Dog's Silver Circlet, an artifact: once a Round, after the character it is equipped to uses an Elemental Skill, that
// Character heals for 2 HP. The skill reaches it only from the active character's equipment, so the user is the one it is on
export const luckyDogsSilverCirclet: GcgCardModule = {
  onSkillUsed: ({ characterIndex, duel, sideIndex }, skill) => {
    const side = takeOne(duel.sides, sideIndex);
    if (skill.kind !== GcgSkillKind.ElementalSkill || side.usedCardIds.includes(LUCKY_DOGS_SILVER_CIRCLET_ID)) return;
    const character = characterIndex === undefined ? undefined : side.characters.at(characterIndex);
    if (!character) return;
    side.usedCardIds.push(LUCKY_DOGS_SILVER_CIRCLET_ID);
    healGcgCharacter(character, HEAL_VALUE);
  },
};
