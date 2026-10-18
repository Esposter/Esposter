import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { ICY_QUILL_ID, icyQuill } from "#src/services/gcg/cards/icyQuill";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

const SPRING_SPIRIT_SUMMONING_DAMAGE = 2;

// Spring Spirit Summoning, Shenhe's skill: 2 Cryo DMG, and an Icy Quill is created on her side once the damage is dealt (the
// wiki's Spring Spirit Summoning (Character Card Skill))
export const springSpiritSummoning: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    placeGcgZoneCard(takeOne(duel.sides, sideIndex).onstages, ICY_QUILL_ID, icyQuill);
  },
  getDamage: () => ({ damageType: Element.Cryo, value: SPRING_SPIRIT_SUMMONING_DAMAGE }),
};
