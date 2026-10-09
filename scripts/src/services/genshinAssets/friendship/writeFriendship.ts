import type { ExcelAvatarFettersLevelRow } from "#src/models/genshinAssets/friendship/ExcelAvatarFettersLevelRow";
import type { ExcelFetterCharacterCardRow } from "#src/models/genshinAssets/friendship/ExcelFetterCharacterCardRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import { FRIENDSHIP_GENERATED_DIRECTORY, FRIENDSHIP_PATH } from "#src/services/genshinAssets/friendship/constants";
import { toFriendshipLevels } from "#src/services/genshinAssets/friendship/toFriendshipLevels";
import { toFriendshipNamecards } from "#src/services/genshinAssets/friendship/toFriendshipNamecards";
import { readRewardMap } from "#src/services/genshinAssets/rewards/readRewardMap";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { mkdirSync } from "node:fs";

// The friendship slice from the dump, the levels from its AvatarFettersLevel table and the namecards from its
// FetterCharacterCard table, written as one file in the World's generated folder
export const writeFriendship = (): void => {
  const levels = toFriendshipLevels(readExcelTable<ExcelAvatarFettersLevelRow>("AvatarFettersLevelExcelConfigData"));
  const namecards = toFriendshipNamecards(
    readExcelTable<ExcelFetterCharacterCardRow>("FetterCharacterCardExcelConfigData"),
    readRewardMap(),
    readExcelTable<MaterialRow>("MaterialExcelConfigData"),
  );
  mkdirSync(FRIENDSHIP_GENERATED_DIRECTORY, { recursive: true });
  writeJsonFile(FRIENDSHIP_PATH, { levels, namecards });
};
