import type { MonsterAssetRow } from "#src/models/genshinAssets/enemies/MonsterAssetRow";

import { collectEnemyKindIds } from "#src/services/genshinAssets/enemies/collectEnemyKindIds";
import { BOSS_KIND_IDS } from "#src/services/genshinAssets/enemies/constants";
import { readMonsterAssetRows } from "#src/services/genshinAssets/enemies/readMonsterAssetRows";
import { readRegionCampsData } from "#src/services/genshinAssets/enemies/readRegionCampsData";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The monster rows of every kind the regions' camps place and of every boss, in ascending order of id
export const readPlacedMonsterRows = async (): Promise<MonsterAssetRow[]> => {
  const monsterRows = readMonsterAssetRows();
  return collectEnemyKindIds(await readRegionCampsData(), BOSS_KIND_IDS).map((kindId) => {
    const monsterRow = monsterRows.find(({ id }) => id === kindId);
    if (!monsterRow) throw new InvalidOperationError(Operation.Read, String(kindId), "has no monster row");
    return monsterRow;
  });
};
