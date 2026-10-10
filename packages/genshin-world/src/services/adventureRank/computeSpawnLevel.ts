import type { WorldLevelRow } from "#src/models/adventureRank/WorldLevelRow";

import { SPAWN_LEVEL_REFERENCE } from "#src/services/adventureRank/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The level a camp's enemy stands at under a World Level: at World Level 0 its own, and from World Level 1 its World
// Level's monster level plus its own level less the reference the table's floor is read from
export const computeSpawnLevel = (
  worldLevelRows: readonly WorldLevelRow[],
  campLevel: number,
  worldLevel: number,
): number => {
  if (worldLevel === 0) return campLevel;
  const worldLevelRow = worldLevelRows.find(({ level }) => level === worldLevel);
  if (worldLevelRow === undefined)
    throw new InvalidOperationError(Operation.Read, "World Level", `has no row at level ${worldLevel}`);
  return worldLevelRow.monsterLevel + campLevel - SPAWN_LEVEL_REFERENCE;
};
