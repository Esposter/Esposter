import type { Character } from "#src/models/character/Character";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";

// A trial entered on the world: the party member it fights with, the stage whose first clear it pays, and the time the
// Arena has run, counted only while the world is open. The pose the player was at when it was entered is where they go back to
export interface TrialArena {
  character: Character;
  elapsedMilliseconds: number;
  returnPose: WorldJumpPose;
  stageId: number;
}
