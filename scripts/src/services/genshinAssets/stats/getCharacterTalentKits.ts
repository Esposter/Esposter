import type { ExcelAvatarRow } from "#src/models/genshinAssets/stats/ExcelAvatarRow";
import type { CharacterTalentKit } from "genshin-world";

import {
  PLAYABLE_AVATAR_USE_TYPE,
  TRAVELER_AVATAR_IDS,
  TRAVELER_DEFAULT_ELEMENT,
} from "#src/services/genshinAssets/stats/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { readSkillDepotMap } from "#src/services/genshinAssets/stats/readSkillDepotMap";
import { readSkillMap } from "#src/services/genshinAssets/stats/readSkillMap";
import { toCharacterTalentKit } from "#src/services/genshinAssets/stats/toCharacterTalentKit";

// Every playable character's combat talents and passives, from the first of its skill sets that names them all, as
// `toCharacterTalentKit` reads them, a Traveler's from its Anemo set. A character none of whose sets does is left out
export const getCharacterTalentKits = (): CharacterTalentKit[] => {
  const skillDepotMap = readSkillDepotMap();
  const skillMap = readSkillMap();
  return readExcelTable<ExcelAvatarRow>("AvatarExcelConfigData")
    .filter(({ useType }) => useType === PLAYABLE_AVATAR_USE_TYPE)
    .flatMap(({ candSkillDepotIds, id, skillDepotId }) => {
      const depotRows = [...new Set([skillDepotId, ...candSkillDepotIds])].flatMap((depotId) => {
        const depotRow = skillDepotMap.get(depotId);
        return depotRow === undefined ? [] : [depotRow];
      });
      const characterTalentKit = toCharacterTalentKit(
        id,
        depotRows,
        skillMap,
        TRAVELER_AVATAR_IDS.has(id) ? TRAVELER_DEFAULT_ELEMENT : undefined,
      );
      return characterTalentKit === undefined ? [] : [characterTalentKit];
    });
};
