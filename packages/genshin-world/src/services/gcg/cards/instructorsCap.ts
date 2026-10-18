import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { createGcgDice } from "#src/services/gcg/effects/createGcgDice";
import { takeOne } from "@esposter/shared";

const INSTRUCTORS_CAP_ID = 312_005;
const INSTRUCTORS_CAP_LIMIT = 3;

// Instructor's Cap, an artifact on a character: after the character's skill triggers an Elemental Reaction, an Elemental Die
// of the character's element is created, up to three times a round
export const instructorsCap: GcgCardModule = {
  onSkillUsed: ({ characterIndex, duel, sideIndex }, _skill, _zoneCard, dealt) => {
    const side = takeOne(duel.sides, sideIndex);
    const character = characterIndex === undefined ? undefined : side.characters.at(characterIndex);
    if (!character || !dealt.some(({ reaction }) => reaction !== undefined)) return;
    const usedCount = side.usedCardIds.filter((cardId) => cardId === INSTRUCTORS_CAP_ID).length;
    if (usedCount >= INSTRUCTORS_CAP_LIMIT) return;
    side.usedCardIds.push(INSTRUCTORS_CAP_ID);
    createGcgDice(side, character.character.element, 1);
  },
};
