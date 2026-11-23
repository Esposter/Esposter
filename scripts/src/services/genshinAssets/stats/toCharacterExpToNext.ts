import type { ExcelAvatarLevelRow } from "#src/models/genshinAssets/stats/ExcelAvatarLevelRow";

// The EXP each level needs to rise past it, from level one, indexed by the level less one
export const toCharacterExpToNext = (rows: readonly ExcelAvatarLevelRow[]): number[] =>
  rows.toSorted((firstRow, secondRow) => firstRow.level - secondRow.level).map(({ exp }) => exp);
