import type { ExcelAvatarFettersLevelRow } from "#src/models/genshinAssets/friendship/ExcelAvatarFettersLevelRow";
import type { FriendshipLevelRow } from "#src/models/genshinAssets/friendship/FriendshipLevelRow";

// Each level's total EXP is the sum of the EXP every level below it needs, so level 1 starts at none. The table's last row
// Is the level past the top, which nothing reaches, so its EXP is never summed into a level
export const toFriendshipLevels = (rows: readonly ExcelAvatarFettersLevelRow[]): FriendshipLevelRow[] => {
  const sortedRows = rows.toSorted((firstRow, secondRow) => firstRow.fetterLevel - secondRow.fetterLevel);
  return sortedRows.map(({ fetterLevel }, index) => ({
    exp: sortedRows.slice(0, index).reduce((totalExp, { needExp }) => totalExp + needExp, 0),
    level: fetterLevel,
  }));
};
