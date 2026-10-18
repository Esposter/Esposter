import type { Enemy } from "#src/models/enemy/Enemy";
import type { AbyssChallenge } from "#src/models/spiralAbyss/AbyssChallenge";

// A chamber fought in the stand-in arena at the Abyss's entrance: its challenge, and the monsters of the half it is on,
// Spawned on the entrance's disc
export interface AbyssArena {
  challenge: AbyssChallenge;
  enemies: Enemy[];
}
