import type { GcgChallengerGame } from "#src/models/gcg/GcgChallengerGame";
import type { GcgPlayerLevel } from "#src/models/gcg/GcgPlayerLevel";

// The card game's levels slice: the Player Levels, and each challenger's duels by the NPC's id
export interface GcgLevels {
  challengerGames: Record<string, GcgChallengerGame[]>;
  playerLevels: GcgPlayerLevel[];
}
