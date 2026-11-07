import type { EnemyDrops } from "#src/models/enemy/EnemyDrops";
import type { EnemyDropTable } from "#src/models/enemy/EnemyDropTable";
import type { EnemyKind } from "#src/models/enemy/EnemyKind";

import { EnemyType } from "#src/models/enemy/EnemyType";
import {
  COMMON_ENEMY_CHARACTER_EXPERIENCES,
  COMMON_ENEMY_MORA_SHARES,
  ELITE_ENEMY_CHARACTER_EXPERIENCES,
  ELITE_ENEMY_MORA_SHARES,
  ENEMY_LEVEL_BAND_COUNT,
  ENEMY_LEVEL_BAND_SIZE,
  ENEMY_MATERIAL_TIER_SHARES,
} from "#src/services/enemy/constants";
import { takeOne } from "@esposter/shared";

// What a defeated enemy drops at its level, by its level band: Character EXP, its drop table's Mora scaled by the band,
// A random amount within the band's range for a common enemy, and each material's count, its whole part always and
// Its fraction as the chance of one more. Character EXP is the band's for any common or elite enemy, with or without a
// Drop table, which gives the Mora and materials alone. A boss drops nothing, its reward claimed from its blossom instead
export const computeEnemyDrops = (
  { enemyType }: EnemyKind,
  dropTable: EnemyDropTable | undefined,
  level: number,
  random: () => number,
): EnemyDrops => {
  if (enemyType === EnemyType.Boss) return { characterExperience: 0, materials: [], mora: 0 };
  const band = Math.min(Math.floor(level / ENEMY_LEVEL_BAND_SIZE), ENEMY_LEVEL_BAND_COUNT - 1);
  const isElite = enemyType === EnemyType.Elite;
  const characterExperience = takeOne(
    isElite ? ELITE_ENEMY_CHARACTER_EXPERIENCES : COMMON_ENEMY_CHARACTER_EXPERIENCES,
    band,
  );
  if (!dropTable) return { characterExperience, materials: [], mora: 0 };
  const { materials, mora } = dropTable;
  const [leastMoraShare, mostMoraShare] = takeOne(COMMON_ENEMY_MORA_SHARES, band);
  const moraShare = isElite
    ? takeOne(ELITE_ENEMY_MORA_SHARES, band)
    : leastMoraShare + (mostMoraShare - leastMoraShare) * random();
  return {
    characterExperience,
    materials: materials.flatMap(({ expectedCount, itemId, tier }) => {
      const bandCount = expectedCount * takeOne(takeOne(ENEMY_MATERIAL_TIER_SHARES, tier), band);
      const count = Math.floor(bandCount) + (random() < bandCount % 1 ? 1 : 0);
      return count > 0 ? [{ count, itemId }] : [];
    }),
    mora: Math.round(mora * moraShare),
  };
};
