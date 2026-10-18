import type { Kit } from "#src/models/kit/Kit";

// The actions a stance plays in place of its character's kit's while it lasts, and the count it holds as it begins, if
// It holds one, which is held under the stance's name
export type KitStanceActions = Pick<
  Kit,
  "chargedAttack" | "chargedAttackStamina" | "dash" | "elementalBurst" | "elementalSkill" | "jump" | "normalAttacks"
> & { resource?: { id: string; startingCount: number } };
