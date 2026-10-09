import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { takeOne } from "@esposter/shared";

const YOIMIYA_ID = 1305;
// Aurous Blaze: for two rounds, after a character other than Yoimiya uses a skill, 1 Pyro DMG is dealt to the opposing
// Active character (the wiki's Ryuukin Saxifrage (Character Card Skill))
const AUROUS_BLAZE_DAMAGE = 1;

export const aurousBlaze: GcgCardModule = {
  initialRounds: 2,
  onSkillUsed: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    if (takeOne(side.characters, side.activeIndex).character.id === YOIMIYA_ID) return undefined;
    return { damageType: Element.Pyro, value: AUROUS_BLAZE_DAMAGE };
  },
};
