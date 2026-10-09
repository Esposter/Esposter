import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitShield } from "#src/models/kit/KitShield";

import { Attribute } from "#src/models/character/Attribute";
import { absorbShieldDamage } from "#src/services/combat/shield/absorbShieldDamage";

// Takes a character's shield to the damage it is dealt, through the combat shield's absorption, written in place. One
// Spent is dropped by the next step. It returns the damage the shield did not absorb, which is all of it with none up
export const absorbKitShield = (effects: readonly KitEffect[], combatant: Combatant, damage: number): number => {
  const shield = effects.find(
    (effect): effect is KitShield => effect.kind === "shield" && effect.characterId === combatant.characterId,
  );
  if (!shield) return damage;
  const overflow = absorbShieldDamage(shield, damage, combatant.attributes.attributeTotalMap[Attribute.ShieldStrength]);
  if (shield.health <= 0) shield.secondsRemaining = 0;
  return overflow;
};
