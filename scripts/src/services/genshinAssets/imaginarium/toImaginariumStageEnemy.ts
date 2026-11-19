import type { MonsterCurveRow } from "#src/models/genshinAssets/enemies/MonsterCurveRow";
import type { MonsterRow } from "#src/models/genshinAssets/enemies/MonsterRow";
import type { ImaginariumStageEnemy } from "genshin-world";

import {
  BASE_ATTACK_PROPERTY,
  BASE_DEFENSE_PROPERTY,
  BASE_HEALTH_PROPERTY,
} from "#src/services/genshinAssets/enemies/constants";
import { getGrowCurve } from "#src/services/genshinAssets/enemies/getGrowCurve";
import { toLevelCurve } from "#src/services/genshinAssets/enemies/toLevelCurve";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The monster a stage fights as, with its stats at the stage's level as the game computes them: each base property times
// The multiplier its grow curve gives at that level
export const toImaginariumStageEnemy = (
  monsterRow: Pick<MonsterRow, "attackBase" | "defenseBase" | "describeId" | "hpBase" | "id" | "propGrowCurves">,
  level: number,
  monsterCurveRows: readonly MonsterCurveRow[],
): ImaginariumStageEnemy => {
  const multiplier = (property: string): number => {
    const value = toLevelCurve(monsterCurveRows, getGrowCurve(monsterRow, property))[level - 1];
    if (value === undefined)
      throw new InvalidOperationError(Operation.Read, String(monsterRow.id), `has no level ${level}`);
    return value;
  };
  return {
    attack: monsterRow.attackBase * multiplier(BASE_ATTACK_PROPERTY),
    defense: monsterRow.defenseBase * multiplier(BASE_DEFENSE_PROPERTY),
    describeId: monsterRow.describeId,
    health: monsterRow.hpBase * multiplier(BASE_HEALTH_PROPERTY),
    monsterId: monsterRow.id,
  };
};
