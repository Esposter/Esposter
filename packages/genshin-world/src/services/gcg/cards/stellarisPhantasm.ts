import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { illusoryBubble } from "#src/services/gcg/cards/illusoryBubble";
import { takeOne } from "@esposter/shared";

const ILLUSORY_BUBBLE_ID = 112_032;
// Stellaris Phantasm, Mona's burst: 4 Hydro DMG, and an Illusory Bubble is created once the damage is dealt (the wiki's
// Stellaris Phantasm (Character Card Skill))
const STELLARIS_PHANTASM_DAMAGE = 4;

export const stellarisPhantasm: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    takeOne(duel.sides, sideIndex).onstages.push(createGcgZoneCard(ILLUSORY_BUBBLE_ID, illusoryBubble));
  },
  getDamage: () => ({ damageType: Element.Hydro, value: STELLARIS_PHANTASM_DAMAGE }),
};
