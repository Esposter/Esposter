import type { CharacterTalentKit } from "genshin-world";

import type { ExcelProudSkillRow } from "#src/models/genshinAssets/stats/ExcelProudSkillRow";
import type { CharacterTalentKit } from "genshin-world";

import { getCharacterSkillDepotRows } from "#src/services/genshinAssets/stats/getCharacterSkillDepotRows";
import { readPlayableAvatarRows } from "#src/services/genshinAssets/stats/readPlayableAvatarRows";
import { readSkillDepotMap } from "#src/services/genshinAssets/stats/readSkillDepotMap";
import { readSkillMap } from "#src/services/genshinAssets/stats/readSkillMap";
import { toCharacterTalentKit } from "#src/services/genshinAssets/stats/toCharacterTalentKit";
import { toProudSkillNameTextIdMap } from "#src/services/genshinAssets/stats/toProudSkillNameTextIdMap";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";

// Every playable character's combat talents and passives, from the first of its skill sets that names them all, as
// `toCharacterTalentKit` reads them, a Traveler's from its Anemo set. A character none of whose sets does is left out
export const getCharacterTalentKits = (): CharacterTalentKit[] => {
  const skillDepotMap = readSkillDepotMap();
  const skillMap = readSkillMap();
  const proudSkillNameTextIdMap = toProudSkillNameTextIdMap(
    readExcelTable<ExcelProudSkillRow>("ProudSkillExcelConfigData"),
  );
  return readPlayableAvatarRows().flatMap((avatarRow) => {
    const characterTalentKit = toCharacterTalentKit(
      avatarRow.id,
      getCharacterSkillDepotRows(avatarRow, skillDepotMap, skillMap),
      skillMap,
      proudSkillNameTextIdMap,
    );
    return characterTalentKit === undefined ? [] : [characterTalentKit];
  });
};
