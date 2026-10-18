import type { GcgChallengerGame } from "#src/models/gcg/GcgChallengerGame";
import type { GcgLevelLock } from "#src/models/gcg/GcgLevelLock";
import type { GcgPlayerLevel } from "#src/models/gcg/GcgPlayerLevel";

// The card game's levels slice: the Player Levels, the locks that hold them, and each challenger's duels by the NPC's id
export interface GcgLevels {
  challengerGames: Record<string, GcgChallengerGame[]>;
  playerLevelLocks: GcgLevelLock[];
  playerLevels: GcgPlayerLevel[];
}
