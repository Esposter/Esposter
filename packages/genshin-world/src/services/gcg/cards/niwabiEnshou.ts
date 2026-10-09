import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";

// Niwabi Enshou: the character it is attached to deals one DMG more with each Physical DMG it converts to Pyro DMG, for
// Three usages. Its Normal Attacks are the Physical DMG, so the +1 is taken on the conversion (the wiki's Niwabi
// Fire-Dance (Character Card Skill))
export const niwabiEnshou: GcgCardModule = {
  initialUsages: 3,
  modifyDamageDealt: (_context, damage, zoneCard) => {
    if (damage.damageType !== GcgDamageKind.Physical || zoneCard.usages <= 0) return damage;
    zoneCard.usages -= 1;
    return { damageType: Element.Pyro, value: damage.value + 1 };
  },
};
