import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { inspirationField } from "#src/services/gcg/cards/inspirationField";
import { takeOne } from "@esposter/shared";

const INSPIRATION_FIELD_ID = 113_031;
// Fantastic Voyage, Bennett's burst: 2 Pyro DMG, and an Inspiration Field is created once the damage is dealt (the wiki's
// Fantastic Voyage (Character Card Skill))
const FANTASTIC_VOYAGE_DAMAGE = 2;

export const fantasticVoyage: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    takeOne(duel.sides, sideIndex).onstages.push(createGcgZoneCard(INSPIRATION_FIELD_ID, inspirationField));
  },
  getDamage: () => ({ damageType: Element.Pyro, value: FANTASTIC_VOYAGE_DAMAGE }),
};
