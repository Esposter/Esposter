import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { ImaginariumMember } from "#src/models/imaginarium/ImaginariumMember";
import type { ImaginariumStageFight } from "#src/models/imaginarium/ImaginariumStageFight";
import type { Combatant } from "#src/models/kit/Combatant";

import { checkIsImaginariumStageReady } from "#src/services/imaginarium/checkIsImaginariumStageReady";
import { fightImaginariumStage } from "#src/services/imaginarium/fightImaginariumStage";
import { runImaginariumKitFight } from "#src/services/imaginarium/runImaginariumKitFight";

// A stage fought by its performers' kits: a cast that cannot perform is refused as the stage's fight refuses it, and
// One that can fights its enemies on the kits' fight, whose defeats, elapsed time and fall the stage's outcome is
// Decided by
export const fightImaginariumKitStage = (
  principalCast: ImaginariumMember[],
  performers: readonly Combatant[],
  enemies: readonly Enemy[],
  enemyTables: EnemyTables,
  timeLimitMilliseconds: number,
): ImaginariumStageFight => {
  if (!checkIsImaginariumStageReady(principalCast)) return { isFought: false, principalCast };
  const { defeats, elapsedMilliseconds, isPartyDown } = runImaginariumKitFight(
    performers,
    enemies,
    enemyTables,
    timeLimitMilliseconds,
  );
  return fightImaginariumStage(
    principalCast,
    { defeats, defeatTarget: enemies.length, elapsedMilliseconds, timeLimitMilliseconds },
    isPartyDown,
  );
};
