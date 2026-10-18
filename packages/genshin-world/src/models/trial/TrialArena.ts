import type { Character } from "#src/models/character/Character";

// A trial entered on the world: the party member it fights with, the stage whose first clear it pays, and the time the
// Arena has run, counted only while the world is open
export interface TrialArena {
  character: Character;
  elapsedMilliseconds: number;
  stageId: number;
}
