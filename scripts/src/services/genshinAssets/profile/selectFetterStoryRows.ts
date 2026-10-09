import type { ExcelFetterStoryRow } from "#src/models/genshinAssets/profile/ExcelFetterStoryRow";

// The stories of the characters the world plays, grouped by character in the order the table gives them within each
export const selectFetterStoryRows = (
  rows: readonly ExcelFetterStoryRow[],
  characterIds: ReadonlySet<number>,
): ExcelFetterStoryRow[] =>
  rows
    .filter(({ avatarId }) => characterIds.has(avatarId))
    .toSorted(
      (firstRow, secondRow) => firstRow.avatarId - secondRow.avatarId || firstRow.fetterId - secondRow.fetterId,
    );
