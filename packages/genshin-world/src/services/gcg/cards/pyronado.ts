import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { pyronadoField } from "#src/services/gcg/cards/pyronadoField";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { takeOne } from "@esposter/shared";

const PYRONADO_FIELD_ID = 113_022;
// Pyronado, Xiangling's elemental burst: 3 Pyro DMG, and a Pyronado is created (the wiki's Pyronado (Character Card Skill))
const PYRONADO_DAMAGE = 3;

export const pyronado: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    takeOne(duel.sides, sideIndex).onstages.push(createGcgZoneCard(PYRONADO_FIELD_ID, pyronadoField));
  },
  getDamage: () => ({ damageType: Element.Pyro, value: PYRONADO_DAMAGE }),
};
