import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { DARKFIRE_FURNACE_ID, darkfireFurnace } from "#src/services/gcg/cards/darkfireFurnace";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

const OMINOUS_STAR_DAMAGE = 3;

// Ominous Star, Abyss Lector's elemental burst: 3 Pyro DMG, and Darkfire Furnace is summoned (the wiki's Ominous Star)
export const ominousStar: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    placeGcgZoneCard(takeOne(duel.sides, sideIndex).summons, DARKFIRE_FURNACE_ID, darkfireFurnace);
  },
  getDamage: () => ({ damageType: Element.Pyro, value: OMINOUS_STAR_DAMAGE }),
};
