import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { pyroInfusion } from "#src/services/gcg/cards/pyroInfusion";
import { takeOne } from "@esposter/shared";

const PYRO_INFUSION_ID = 113_011;
// Dawn: 8 Pyro DMG, and the character gains Pyro Infusion once the damage is dealt (the wiki's Dawn (Character Card Skill))
const DAWN_DAMAGE = 8;

// Dawn, Diluc's burst
export const dawn: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    takeOne(side.characters, side.activeIndex).statuses.push(createGcgZoneCard(PYRO_INFUSION_ID, pyroInfusion));
  },
  getDamage: () => ({ damageType: Element.Pyro, value: DAWN_DAMAGE }),
};
