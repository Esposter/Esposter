import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitShield } from "#src/models/kit/KitShield";

import { Attribute } from "#src/models/character/Attribute";
import { absorbShieldDamage } from "#src/services/combat/shield/absorbShieldDamage";

// An enemy's strike on the character on the field, taken by every live shield on the team at once: each one absorbs the
// Full damage through the combat shield's absorption at the struck character's shield strength, written in place, and the
// Member takes the least any of them passes on, so none while one holds it all and the whole damage with none up. A shield
// Whose health is spent is ended, and the next step drops it
export const absorbKitShield = (effects: readonly KitEffect[], combatant: Combatant, damage: number): number => {
  const shieldStrength = combatant.attributes.attributeTotalMap[Attribute.ShieldStrength];
  const shields = effects.filter(
    (effect): effect is KitShield => effect.kind === "shield" && effect.secondsRemaining > 0,
  );
  let overflow = damage;
  for (const shield of shields) {
    overflow = Math.min(overflow, absorbShieldDamage(shield, damage, shieldStrength));
    if (shield.health <= 0) shield.secondsRemaining = 0;
  }
  return overflow;
};
