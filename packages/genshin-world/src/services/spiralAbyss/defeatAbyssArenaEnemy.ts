import type { AbyssArena } from "#src/models/spiralAbyss/AbyssArena";

import { checkIsAbyssChallengeCleared } from "#src/services/spiralAbyss/checkIsAbyssChallengeCleared";
import { advanceAbyssHalf } from "#src/services/spiralAbyss/advanceAbyssHalf";
import { createAbyssHalfCamp } from "#src/services/spiralAbyss/createAbyssHalfCamp";
import { getAbyssCampId } from "#src/services/spiralAbyss/getAbyssCampId";

// A defeat of the camp in play counts toward its half, and the half's last enemy advances the chamber: the next half's camp
// Spawns beside the entrance, or the chamber clears and its camp is dropped. A defeat of any other camp is not counted
export const defeatAbyssArenaEnemy = (arena: AbyssArena, defeatedCampId: string | undefined): AbyssArena => {
  if (arena.camp === undefined || arena.camp.id !== defeatedCampId) return arena;
  const defeatsInHalf = arena.defeatsInHalf + 1;
  if (defeatsInHalf < arena.camp.members.length) return { ...arena, defeatsInHalf };
  const challenge = advanceAbyssHalf(arena.challenge, 0);
  if (checkIsAbyssChallengeCleared(challenge)) return { ...arena, camp: undefined, challenge, defeatsInHalf: 0 };
  return {
    ...arena,
    camp: createAbyssHalfCamp(
      arena.areaId,
      getAbyssCampId(arena.startedAt, challenge.defeatedHalfCount),
      arena.center,
      arena.chamber.halfMonsterDescribeIds[challenge.defeatedHalfCount] ?? [],
      arena.enemyKindIds,
      arena.chamber.monsterLevel,
    ),
    challenge,
    defeatsInHalf: 0,
  };
};
