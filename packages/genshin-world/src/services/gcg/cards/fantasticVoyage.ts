import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { inspirationField } from "#src/services/gcg/cards/inspirationField";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";
import { INSPIRATION_FIELD_ID } from "#src/services/gcg/cards/constants";

// Fantastic Voyage, Bennett's burst: 2 Pyro DMG, and an Inspiration Field is created once the damage is dealt (the wiki's
// Fantastic Voyage (Character Card Skill))
const FANTASTIC_VOYAGE_DAMAGE = 2;

export const fantasticVoyage: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    placeGcgZoneCard(takeOne(duel.sides, sideIndex).onstages, INSPIRATION_FIELD_ID, inspirationField);
  },
  getDamage: () => ({ damageType: Element.Pyro, value: FANTASTIC_VOYAGE_DAMAGE }),
};
