import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { illusoryBubble } from "#src/services/gcg/cards/illusoryBubble";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";
import { ILLUSORY_BUBBLE_ID } from "#src/services/gcg/cards/constants";

// Stellaris Phantasm, Mona's burst: 4 Hydro DMG, and an Illusory Bubble is created once the damage is dealt (the wiki's
// Stellaris Phantasm (Character Card Skill))
const STELLARIS_PHANTASM_DAMAGE = 4;

export const stellarisPhantasm: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    placeGcgZoneCard(takeOne(duel.sides, sideIndex).onstages, ILLUSORY_BUBBLE_ID, illusoryBubble);
  },
  getDamage: () => ({ damageType: Element.Hydro, value: STELLARIS_PHANTASM_DAMAGE }),
};
