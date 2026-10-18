import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { icicle } from "#src/services/gcg/cards/icicle";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";
import { ICICLE_ID } from "#src/services/gcg/cards/constants";

// Glacial Waltz, Kaeya's elemental burst: 1 Cryo DMG, and an Icicle is created (the wiki's Glacial Waltz (Character Card
// Skill))
const GLACIAL_WALTZ_DAMAGE = 1;

export const glacialWaltz: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    placeGcgZoneCard(takeOne(duel.sides, sideIndex).onstages, ICICLE_ID, icicle);
  },
  getDamage: () => ({ damageType: Element.Cryo, value: GLACIAL_WALTZ_DAMAGE }),
};
