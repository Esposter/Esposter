import type { Enemy } from "#src/models/enemy/Enemy";
import type { PartyTeam } from "#src/models/party/PartyTeam";
import type { AbyssArena } from "#src/models/spiralAbyss/AbyssArena";
import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";
import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";

import { createAbyssChallenge } from "#src/services/spiralAbyss/createAbyssChallenge";

// A chamber started in the arena on a party set: its challenge, and the monsters of its first half on the disc, spawned
// By `spawnHalf`. A party set its challenge refuses has no arena
export const createAbyssArena = (
  floor: AbyssFloor,
  chamber: AbyssChamber,
  teams: readonly PartyTeam[],
  spawnHalf: (halfIndex: number) => Enemy[],
): AbyssArena | undefined => {
  const challenge = createAbyssChallenge(floor, chamber, teams);
  return challenge === undefined ? undefined : { challenge, enemies: spawnHalf(0) };
};
