import type { ExcelAvatarRow } from "#src/models/genshinAssets/stats/ExcelAvatarRow";
import type { CharacterTalentKit } from "genshin-world";

import { PLAYABLE_AVATAR_USE_TYPE } from "#src/services/genshinAssets/stats/constants";
import { getCharacterSkillDepotRows } from "#src/services/genshinAssets/stats/getCharacterSkillDepotRows";
import { readSkillDepotMap } from "#src/services/genshinAssets/stats/readSkillDepotMap";
import { readSkillMap } from "#src/services/genshinAssets/stats/readSkillMap";
import { toCharacterTalentKit } from "#src/services/genshinAssets/stats/toCharacterTalentKit";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";

// Every playable character's combat talents and passives, from the first of its skill sets that names them all, as
// `toCharacterTalentKit` reads them, a Traveler's from its Anemo set. A character none of whose sets does is left out
export const getCharacterTalentKits = (): CharacterTalentKit[] => {
  const skillDepotMap = readSkillDepotMap();
  const skillMap = readSkillMap();
  return readExcelTable<ExcelAvatarRow>("AvatarExcelConfigData")
    .filter(({ useType }) => useType === PLAYABLE_AVATAR_USE_TYPE)
    .flatMap((avatarRow) => {
      const characterTalentKit = toCharacterTalentKit(
        avatarRow.id,
        getCharacterSkillDepotRows(avatarRow, skillDepotMap, skillMap),
        skillMap,
      );
      return characterTalentKit === undefined ? [] : [characterTalentKit];
    });
};
