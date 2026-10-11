import type { Combatant } from "#src/models/kit/Combatant";

// A stance a character's kit takes for the seconds left of it, its combatant built once as it starts with the stance's
// Own actions in place of its kit's, and counting the seconds it has been held, which its end reads
export interface KitStance {
  characterId: number;
  combatant: Combatant;
  elapsedSeconds: number;
  kind: "stance";
  secondsRemaining: number;
}
