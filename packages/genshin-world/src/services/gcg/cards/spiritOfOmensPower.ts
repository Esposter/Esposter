import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { takeOne } from "@esposter/shared";

const SPIRIT_OF_OMENS_POWER_HP = 7;
const SPIRIT_OF_OMENS_POWER_ENERGY = 1;

// Spirit of Omen's Power, Eremite Scorching Loremaster's passive: after she takes DMG at 7 HP or less, she gains 1 Energy,
// Once per Round, keyed by the passive's skill id
export const spiritOfOmensPower: GcgSkillModule = {
  afterDamageTaken: (context) => {
    const side = takeOne(context.duel.sides, context.sideIndex);
    const character = context.characterIndex === undefined ? undefined : side.characters.at(context.characterIndex);
    const skill = context.skill;
    if (!character || !skill || character.hp > SPIRIT_OF_OMENS_POWER_HP || side.usedCardIds.includes(skill.id)) return;
    side.usedCardIds.push(skill.id);
    character.energy = Math.min(character.character.maxEnergy, character.energy + SPIRIT_OF_OMENS_POWER_ENERGY);
  },
};
