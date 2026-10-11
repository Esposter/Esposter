import type { Kit } from "#src/models/kit/Kit";

// The actions a stance plays in place of its character's kit's while it lasts
export type KitStanceActions = Pick<
  Kit,
  "chargedAttack" | "chargedAttackStamina" | "elementalBurst" | "elementalSkill" | "normalAttacks"
>;
