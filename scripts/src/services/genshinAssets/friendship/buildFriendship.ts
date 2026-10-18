import type { ExcelAvatarFettersLevelRow } from "#src/models/genshinAssets/friendship/ExcelAvatarFettersLevelRow";
import type { ExcelFetterCharacterCardRow } from "#src/models/genshinAssets/friendship/ExcelFetterCharacterCardRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import { toFriendshipLevels } from "#src/services/genshinAssets/friendship/toFriendshipLevels";
import { toFriendshipNamecards } from "#src/services/genshinAssets/friendship/toFriendshipNamecards";
import { MATERIAL_TABLE_NAME } from "#src/services/genshinAssets/items/constants";
import { readRewardMap } from "#src/services/genshinAssets/rewards/readRewardMap";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

// The friendship record from the dump, the levels from its AvatarFettersLevel table and the namecards from its
// FetterCharacterCard table, published as one record of the friendship dataset
export const buildFriendship = (): Record<string, unknown> => {
  const levels = toFriendshipLevels(readExcelTable<ExcelAvatarFettersLevelRow>("AvatarFettersLevelExcelConfigData"));
  const namecards = toFriendshipNamecards(
    readExcelTable<ExcelFetterCharacterCardRow>("FetterCharacterCardExcelConfigData"),
    readRewardMap(),
    readExcelTable<MaterialRow>(MATERIAL_TABLE_NAME),
  );
  return { [`${GameDataset.Friendship}/friendship`]: { levels, namecards } };
};
