import type { ExcelAvatarRow } from "#src/models/genshinAssets/stats/ExcelAvatarRow";

import { AVATAR_TABLE_NAME } from "#src/services/genshinAssets/profile/constants";
import { PLAYABLE_AVATAR_USE_TYPE, WeaponTypeNameSet } from "#src/services/genshinAssets/stats/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";

// The character table's playable characters: its formal rows that wield a kind of weapon the open world gives one
export const readPlayableAvatarRows = (): ExcelAvatarRow[] =>
  readExcelTable<ExcelAvatarRow>(AVATAR_TABLE_NAME).filter(
    ({ useType, weaponType }) => useType === PLAYABLE_AVATAR_USE_TYPE && WeaponTypeNameSet.has(weaponType),
  );
