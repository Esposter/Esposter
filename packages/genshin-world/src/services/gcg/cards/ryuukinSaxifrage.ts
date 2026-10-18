import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { aurousBlaze } from "#src/services/gcg/cards/aurousBlaze";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";
import { AUROUS_BLAZE_ID } from "#src/services/gcg/cards/constants";

// Ryuukin Saxifrage, Yoimiya's burst: 3 Pyro DMG, and an Aurous Blaze is created once the damage is dealt (the wiki's
// Ryuukin Saxifrage (Character Card Skill))
const RYUUKIN_SAXIFRAGE_DAMAGE = 3;

export const ryuukinSaxifrage: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    placeGcgZoneCard(takeOne(duel.sides, sideIndex).onstages, AUROUS_BLAZE_ID, aurousBlaze);
  },
  getDamage: () => ({ damageType: Element.Pyro, value: RYUUKIN_SAXIFRAGE_DAMAGE }),
};
