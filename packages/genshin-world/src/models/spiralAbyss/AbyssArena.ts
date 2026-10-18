import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { AbyssChallenge } from "#src/models/spiralAbyss/AbyssChallenge";
import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";
import type { GroundPoint } from "genshin-engine";

// A chamber fought in the arena beside the Abyss's entrance: its challenge, and the camp of the half in play, which spawns
// Beside the entrance and is dropped once the chamber clears or fails. The defeats of that camp count toward its half
export interface AbyssArena {
  areaId: string;
  camp: EnemyCamp | undefined;
  center: GroundPoint;
  challenge: AbyssChallenge;
  chamber: AbyssChamber;
  defeatsInHalf: number;
  enemyKindIds: Readonly<Record<string, number>>;
  startedAt: number;
}
