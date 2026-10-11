import type { AttackTag } from "#src/models/combat/AttackTag";
import type { Kit } from "#src/models/kit/Kit";

// A stance a character's kit takes for the seconds left of it, its kit built once as it starts with the stance's own
// Actions in place of the kit's, and counting the seconds it has been held, which its end reads. Each group of its
// Actions deals the damage type its attack tags name, which a hit of the group is read as, whatever list it sits in
export interface KitStance {
  attackTags: Record<"chargedAttack" | "elementalBurst" | "elementalSkill" | "normalAttacks", AttackTag>;
  characterId: number;
  elapsedSeconds: number;
  kind: "stance";
  kit: Kit;
  secondsRemaining: number;
}
