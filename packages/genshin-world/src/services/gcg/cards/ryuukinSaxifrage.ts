import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { aurousBlaze } from "#src/services/gcg/cards/aurousBlaze";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { takeOne } from "@esposter/shared";

const AUROUS_BLAZE_ID = 113_052;
// Ryuukin Saxifrage, Yoimiya's burst: 3 Pyro DMG, and an Aurous Blaze is created once the damage is dealt (the wiki's
// Ryuukin Saxifrage (Character Card Skill))
const RYUUKIN_SAXIFRAGE_DAMAGE = 3;

export const ryuukinSaxifrage: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    takeOne(duel.sides, sideIndex).onstages.push(createGcgZoneCard(AUROUS_BLAZE_ID, aurousBlaze));
  },
  getDamage: () => ({ damageType: Element.Pyro, value: RYUUKIN_SAXIFRAGE_DAMAGE }),
};
