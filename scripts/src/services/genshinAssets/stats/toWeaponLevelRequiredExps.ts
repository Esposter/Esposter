import type { ExcelWeaponLevelRow } from "#src/models/genshinAssets/stats/ExcelWeaponLevelRow";

import { InvalidOperationError, Operation } from "@esposter/shared";

// Each rarity's EXP to rise past every level, keyed by its stars, the table's one row per level turned into one column
// Per rarity, its index the level less one
export const toWeaponLevelRequiredExps = (rows: readonly ExcelWeaponLevelRow[]): Record<string, number[]> => {
  const sortedRows = rows.toSorted((firstRow, secondRow) => firstRow.level - secondRow.level);
  const rarityCount = sortedRows[0]?.requiredExps.length ?? 0;
  return Object.fromEntries(
    Array.from({ length: rarityCount }, (_value, rarityIndex) => [
      String(rarityIndex + 1),
      sortedRows.map(({ level, requiredExps }) => {
        const requiredExp = requiredExps[rarityIndex];
        if (requiredExp === undefined)
          throw new InvalidOperationError(Operation.Read, String(rarityIndex + 1), `no EXP at level ${level}`);
        return requiredExp;
      }),
    ]),
  );
};
