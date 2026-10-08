import type { ExcelAvatarFettersLevelRow } from "#src/models/genshinAssets/friendship/ExcelAvatarFettersLevelRow";

import { FRIENDSHIP_GENERATED_DIRECTORY, FRIENDSHIP_LEVELS_PATH } from "#src/services/genshinAssets/friendship/constants";
import { toFriendshipLevels } from "#src/services/genshinAssets/friendship/toFriendshipLevels";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { mkdirSync, writeFileSync } from "node:fs";

// The friendship levels from the dump's AvatarFettersLevel table, written as one slice in the World's generated folder
export const writeFriendshipLevels = (): void => {
  const levels = toFriendshipLevels(readExcelTable<ExcelAvatarFettersLevelRow>("AvatarFettersLevelExcelConfigData"));
  mkdirSync(FRIENDSHIP_GENERATED_DIRECTORY, { recursive: true });
  writeFileSync(FRIENDSHIP_LEVELS_PATH, `${JSON.stringify(levels, undefined, 2)}\n`);
};
