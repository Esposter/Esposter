import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import {
  ROCK_PAPER_SCISSORS_PAPER,
  ROCK_PAPER_SCISSORS_SCISSORS,
} from "#src/services/gcg/cards/rockPaperScissorsPrepared";
import { prepareGcgSkill } from "#src/services/gcg/effects/prepareGcgSkill";
import { takeOne } from "@esposter/shared";

const ROCK_PAPER_SCISSORS_COMBO_DAMAGE = 2;

// Rock-Paper-Scissors Combo, Electro Hypostasis' elemental skill: 2 Electro DMG, then Scissors and Paper are prepared for the
// Side's next turn (the wiki's Rock-Paper-Scissors Combo)
export const rockPaperScissorsCombo: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    const characterIndex = takeOne(duel.sides, sideIndex).activeIndex;
    prepareGcgSkill(duel, sideIndex, characterIndex, ROCK_PAPER_SCISSORS_SCISSORS);
    prepareGcgSkill(duel, sideIndex, characterIndex, ROCK_PAPER_SCISSORS_PAPER);
  },
  getDamage: () => ({ damageType: Element.Electro, value: ROCK_PAPER_SCISSORS_COMBO_DAMAGE }),
};
