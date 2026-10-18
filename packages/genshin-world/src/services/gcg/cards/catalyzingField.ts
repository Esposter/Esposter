import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { GCG_CATALYZING_FIELD_MAX_USAGES } from "#src/services/gcg/constants";

const CATALYZING_FIELD_BONUS = 1;

// Catalyzing Field: when its side's skill deals Dendro or Electro DMG to the opposing active character, that DMG is one
// More and the field spends a usage, for two usages
export const catalyzingField: GcgCardModule = {
  initialUsages: 2,
  maxUsages: GCG_CATALYZING_FIELD_MAX_USAGES,
  modifyDamageDealt: (_context, damage, zoneCard) => {
    if (damage.damageType !== Element.Dendro && damage.damageType !== Element.Electro) return damage;
    zoneCard.usages -= 1;
    return { ...damage, value: damage.value + CATALYZING_FIELD_BONUS };
  },
};
