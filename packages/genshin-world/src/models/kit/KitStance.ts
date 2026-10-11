import type { Kit } from "#src/models/kit/Kit";

// A stance a character's kit takes for the seconds left of it, its kit built once as it starts with the stance's own
// Actions in place of the kit's, and counting the seconds it has been held, which its end reads
export interface KitStance {
  characterId: number;
  elapsedSeconds: number;
  kind: "stance";
  kit: Kit;
  secondsRemaining: number;
}
