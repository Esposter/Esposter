import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { ROCK_PAPER_SCISSORS_PAPER } from "#src/services/gcg/cards/rockPaperScissorsPrepared";
import { prepareGcgSkill } from "#src/services/gcg/effects/prepareGcgSkill";

const ROCK_PAPER_SCISSORS_SCISSORS_DAMAGE = 2;

// Scissors, a skill Electro Hypostasis prepares: 2 Electro DMG, then Paper is prepared for the side's next turn, for the
// Character that prepared Scissors (the wiki's Rock-Paper-Scissors Combo: Scissors)
export const rockPaperScissorsScissors: GcgSkillModule = {
  afterDamage: ({ characterIndex, duel, sideIndex }) => {
    if (characterIndex !== undefined) prepareGcgSkill(duel, sideIndex, characterIndex, ROCK_PAPER_SCISSORS_PAPER);
  },
  getDamage: () => ({ damageType: Element.Electro, value: ROCK_PAPER_SCISSORS_SCISSORS_DAMAGE }),
};
