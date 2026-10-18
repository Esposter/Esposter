import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { DomainChallengeLevel } from "#src/services/domains/domainChallengeLevels";
import type { GroundPoint } from "genshin-engine";

import { DOMAIN_ARENA_SPREAD } from "#src/services/domains/constants";
import { OUTCROP_CAMP_ENEMY_KIND_IDS } from "#src/services/leyLine/constants";
import { takeOne } from "@esposter/shared";

// The camp a challenge level spawns at its arena: every enemy of every wave at once, standing evenly round the centre. Each
// Enemy is a stand-in kind drawn as an outcrop's camp draws its own, since the wiki's enemy names have no kind in the game
// Tables this build reads, and the names stay in the level's data (PROVISIONAL)
export const createDomainArenaCamp = (
  areaId: string,
  campId: string,
  center: GroundPoint,
  level: DomainChallengeLevel,
  enemyLevel: number,
  random: () => number,
): EnemyCamp => {
  const count = level.waves.flat().reduce((total, { count: groupCount }) => total + groupCount, 0);
  return {
    areaId,
    id: campId,
    members: Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * 2 * Math.PI;
      return {
        enemyKindId: takeOne(OUTCROP_CAMP_ENEMY_KIND_IDS, Math.floor(random() * OUTCROP_CAMP_ENEMY_KIND_IDS.length)),
        id: String(index),
        level: enemyLevel,
        patrol: [],
        position: {
          x: center.x + Math.cos(angle) * DOMAIN_ARENA_SPREAD,
          z: center.z + Math.sin(angle) * DOMAIN_ARENA_SPREAD,
        },
      };
    }),
  };
};
