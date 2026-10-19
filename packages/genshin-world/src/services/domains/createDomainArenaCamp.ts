import type { DomainChallengeEnemy } from "#src/models/domains/DomainChallengeEnemy";
import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { GroundPoint } from "genshin-engine";

import { DOMAIN_ARENA_SPREAD } from "#src/services/domains/constants";
import { placeCampRing } from "#src/services/enemy/placeCampRing";
import { OUTCROP_CAMP_ENEMY_KIND_IDS } from "#src/services/leyLine/constants";
import { takeRandom } from "@esposter/shared";

// The camp one wave of a challenge level spawns at its arena: the wave's enemies standing evenly round the centre. Each
// Enemy is a stand-in kind drawn as an outcrop's camp draws its own, since the wiki's enemy names have no kind in the game
// Tables this build reads, and the names stay in the level's data (PROVISIONAL)
export const createDomainArenaCamp = (
  areaId: string,
  campId: string,
  center: GroundPoint,
  wave: readonly Pick<DomainChallengeEnemy, "count" | "enemyKindId">[],
  enemyLevel: number,
  random: () => number,
): EnemyCamp => {
  const enemyKindIds = wave.flatMap(({ count, enemyKindId }) =>
    Array.from({ length: count }, () => enemyKindId ?? takeRandom(OUTCROP_CAMP_ENEMY_KIND_IDS, random)),
  );
  return {
    areaId,
    id: campId,
    members: placeCampRing(
      center,
      DOMAIN_ARENA_SPREAD,
      enemyKindIds.map((enemyKindId) => ({ enemyKindId, level: enemyLevel })),
    ),
  };
};
