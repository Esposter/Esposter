import type { ExcelDungeonRow } from "#src/models/genshinAssets/domains/ExcelDungeonRow";

import { DUNGEON_LEVEL_ENTITY_TABLE_NAME } from "#src/services/genshinAssets/domains/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A daily fight's ley line disorder is the one level config its dungeon row names, read through the entity table's config name
export const getDisorder = (dungeon: ExcelDungeonRow, entityNames: ReadonlyMap<number, string>): string => {
  const entityIds = Object.keys(dungeon.levelConfigMap ?? {});
  const disorder = entityIds.length === 1 ? entityNames.get(Number(entityIds[0])) : undefined;
  if (!disorder)
    throw new InvalidOperationError(
      Operation.Read,
      DUNGEON_LEVEL_ENTITY_TABLE_NAME,
      `names no single ley line disorder for level ${dungeon.id}`,
    );
  return disorder;
};
