import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { icicle } from "#src/services/gcg/cards/icicle";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { takeOne } from "@esposter/shared";

const ICICLE_ID = 111_031;
// Glacial Waltz, Kaeya's elemental burst: 1 Cryo DMG, and an Icicle is created (the wiki's Glacial Waltz (Character Card
// Skill))
const GLACIAL_WALTZ_DAMAGE = 1;

export const glacialWaltz: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    takeOne(duel.sides, sideIndex).onstages.push(createGcgZoneCard(ICICLE_ID, icicle));
  },
  getDamage: () => ({ damageType: Element.Cryo, value: GLACIAL_WALTZ_DAMAGE }),
};
