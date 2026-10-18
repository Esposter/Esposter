import type { Enemy } from "#src/models/enemy/Enemy";
import type { AbyssArena } from "#src/models/spiralAbyss/AbyssArena";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { advanceAbyssHalf } from "#src/services/spiralAbyss/advanceAbyssHalf";
import { checkIsAbyssChallengeCleared } from "#src/services/spiralAbyss/checkIsAbyssChallengeCleared";
import { checkIsAbyssChallengeFailed } from "#src/services/spiralAbyss/checkIsAbyssChallengeFailed";
import { stepAbyssChallenge } from "#src/services/spiralAbyss/stepAbyssChallenge";

// The arena stepped by `seconds`. Its clock runs while the chamber is fought, and a half whose monsters are all defeated
// Advances, its next half spawning on the disc in turn. A chamber cleared or failed stops there: its clock no longer runs,
// So its stars keep the seconds it had at the clear, and a failed chamber has no monsters left
export const stepAbyssArena = (
  arena: AbyssArena,
  seconds: number,
  spawnHalf: (halfIndex: number) => Enemy[],
): AbyssArena => {
  if (checkIsAbyssChallengeCleared(arena.challenge) || checkIsAbyssChallengeFailed(arena.challenge)) return arena;
  const enemiesLeft = arena.enemies.filter(({ state }) => state !== EnemyState.Dead).length;
  const challenge = advanceAbyssHalf(stepAbyssChallenge(arena.challenge, seconds), enemiesLeft);
  if (checkIsAbyssChallengeFailed(challenge)) return { challenge, enemies: [] };
  if (challenge.defeatedHalfCount === arena.challenge.defeatedHalfCount) return { challenge, enemies: arena.enemies };
  return { challenge, enemies: checkIsAbyssChallengeCleared(challenge) ? [] : spawnHalf(challenge.defeatedHalfCount) };
};
