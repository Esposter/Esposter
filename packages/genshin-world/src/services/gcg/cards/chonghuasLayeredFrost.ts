import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { chonghuaFrostField } from "#src/services/gcg/cards/chonghuaFrostField";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { takeOne } from "@esposter/shared";

const CHONGHUA_FROST_FIELD_ID = 111_041;
// Chonghua's Layered Frost, Chongyun's elemental skill: 3 Cryo DMG, and a Chonghua Frost Field is created once the damage is
// Dealt (the wiki's Chonghua's Layered Frost (Character Card Skill))
const CHONGHUAS_LAYERED_FROST_DAMAGE = 3;

export const chonghuasLayeredFrost: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    takeOne(duel.sides, sideIndex).onstages.push(createGcgZoneCard(CHONGHUA_FROST_FIELD_ID, chonghuaFrostField));
  },
  getDamage: () => ({ damageType: Element.Cryo, value: CHONGHUAS_LAYERED_FROST_DAMAGE }),
};
