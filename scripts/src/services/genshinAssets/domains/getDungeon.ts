import type { ExcelDungeonRow } from "#src/models/genshinAssets/domains/ExcelDungeonRow";

import { DOMAIN_LEVEL_TYPE, DUNGEON_TABLE_NAME } from "#src/services/genshinAssets/domains/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const getDungeon = (dungeonMap: ReadonlyMap<number, ExcelDungeonRow>, dungeonId: number): ExcelDungeonRow => {
  const dungeon = dungeonMap.get(dungeonId);
  if (dungeon === undefined || dungeon.type !== DOMAIN_LEVEL_TYPE)
    throw new InvalidOperationError(Operation.Read, DUNGEON_TABLE_NAME, `has no domain level ${dungeonId}`);
  return dungeon;
};
