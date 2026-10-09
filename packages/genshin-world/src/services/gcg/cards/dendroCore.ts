import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

const DENDRO_CORE_BONUS = 2;

// Dendro Core: when its side's skill deals Pyro or Electro DMG to the opposing active character, that DMG is two more and
// The core spends its usage, for one usage
export const dendroCore: GcgCardModule = {
  initialUsages: 1,
  modifyDamageDealt: (_context, damage, zoneCard) => {
    if (damage.damageType !== Element.Pyro && damage.damageType !== Element.Electro) return damage;
    zoneCard.usages -= 1;
    return { ...damage, value: damage.value + DENDRO_CORE_BONUS };
  },
};
