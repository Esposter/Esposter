import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { PYRONADO_FIELD_ID } from "#src/services/gcg/cards/constants";
import { pyronadoField } from "#src/services/gcg/cards/pyronadoField";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

// Pyronado, Xiangling's elemental burst: 3 Pyro DMG, and a Pyronado is created (the wiki's Pyronado (Character Card Skill))
const PYRONADO_DAMAGE = 3;

export const pyronado: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    placeGcgZoneCard(takeOne(duel.sides, sideIndex).onstages, PYRONADO_FIELD_ID, pyronadoField);
  },
  getDamage: () => ({ damageType: Element.Pyro, value: PYRONADO_DAMAGE }),
};
