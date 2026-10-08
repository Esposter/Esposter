import type { Shield } from "#src/models/combat/Shield";

import { Element } from "#src/models/Element";
import { ELEMENTAL_SHIELD_ABSORPTION, GEO_SHIELD_ABSORPTION } from "#src/services/combat/shield/constants";

// Damage taken on a shield, its health written in place, and the damage left over for the character. Each point of
// Health absorbs its absorption times one plus the character's shield strength: a Geo shield's 150% of any damage, an
// Elemental shield's 250% of its own element, and 100% otherwise, physical damage included
export const absorbShieldDamage = (
  shield: Shield,
  damage: number,
  shieldStrength: number,
  element?: Element,
): number => {
  const absorption =
    shield.element === Element.Geo
      ? GEO_SHIELD_ABSORPTION
      : shield.element && shield.element === element
        ? ELEMENTAL_SHIELD_ABSORPTION
        : 1;
  const efficiency = absorption * (1 + shieldStrength);
  const capacity = shield.health * efficiency;
  if (damage >= capacity) {
    shield.health = 0;
    return damage - capacity;
  }

  shield.health -= damage / efficiency;
  return 0;
};
