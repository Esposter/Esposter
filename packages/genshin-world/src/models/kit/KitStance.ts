import type { AttackTag } from "#src/models/combat/AttackTag";
import type { Kit } from "#src/models/kit/Kit";

// A stance a character's kit takes for the seconds left of it, playing its own normal attacks, charged attack, skill and
// Burst in place of the kit's while it lasts, and counting the seconds it has been held, which its end reads. Each group
// Of its actions deals the damage type its attack tags name, which a hit of the group is read as, whatever list it sits in
export interface KitStance {
  actions: Pick<Kit, "chargedAttack" | "chargedAttackStamina" | "elementalBurst" | "elementalSkill" | "normalAttacks">;
  attackTags: Record<"chargedAttack" | "elementalBurst" | "elementalSkill" | "normalAttacks", AttackTag>;
  characterId: number;
  elapsedSeconds: number;
  kind: "stance";
  secondsRemaining: number;
}
