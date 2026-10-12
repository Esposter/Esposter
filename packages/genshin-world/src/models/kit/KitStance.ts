import type { Combatant } from "#src/models/kit/Combatant";
import type { KitSwapEndable } from "#src/models/kit/KitSwapEndable";

// A stance a character's kit takes for the seconds left of it, its combatant built once as it starts with the stance's
// Own actions in place of its kit's, counting the seconds it has been held, which its end reads, and whether its
// Character leaving the field ends it
export interface KitStance extends KitSwapEndable {
  characterId: number;
  combatant: Combatant;
  elapsedSeconds: number;
  kind: "stance";
  secondsRemaining: number;
}
