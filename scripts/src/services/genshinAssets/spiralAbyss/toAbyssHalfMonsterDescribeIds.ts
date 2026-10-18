import type { ExcelTowerLevelRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerLevelRow";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The monsters of each half of a chamber by their describe ids, from the lists its level row holds. A chamber the dump lists no
// Monsters for has no halves, as the Moon Spire's do, and one that lists monsters holds one list for each of its floor's teams
export const toAbyssHalfMonsterDescribeIds = (levelRow: ExcelTowerLevelRow, teamCount: number): number[][] => {
  const halves = [levelRow.firstMonsterList, levelRow.secondMonsterList].filter(
    (describeIds) => describeIds.length > 0,
  );
  if (halves.length > 0 && halves.length !== teamCount)
    throw new InvalidOperationError(
      Operation.Read,
      String(levelRow.levelId),
      `lists ${halves.length} halves for ${teamCount} teams`,
    );
  return halves;
};
