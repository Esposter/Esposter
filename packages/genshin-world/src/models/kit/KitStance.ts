import type { Kit } from "#src/models/kit/Kit";

// A stance a character's kit takes for the seconds left of it, playing its own normal attacks, charged attack, skill and
// Burst in place of the kit's while it lasts, and counting the seconds it has been held, which its end reads
export interface KitStance {
  actions: Pick<Kit, "chargedAttack" | "chargedAttackStamina" | "elementalBurst" | "elementalSkill" | "normalAttacks">;
  characterId: number;
  elapsedSeconds: number;
  kind: "stance";
  secondsRemaining: number;
}
