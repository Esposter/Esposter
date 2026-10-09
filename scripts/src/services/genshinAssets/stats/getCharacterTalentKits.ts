import type { ExcelAvatarRow } from "#src/models/genshinAssets/stats/ExcelAvatarRow";
import type { ExcelSkillDepotRow } from "#src/models/genshinAssets/stats/ExcelSkillDepotRow";
import type { ExcelSkillRow } from "#src/models/genshinAssets/stats/ExcelSkillRow";
import type { CharacterTalentKit } from "genshin-world";

import {
  PLAYABLE_AVATAR_USE_TYPE,
  TRAVELER_AVATAR_IDS,
  TRAVELER_DEFAULT_ELEMENT,
} from "#src/services/genshinAssets/stats/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { toCharacterTalentKit } from "#src/services/genshinAssets/stats/toCharacterTalentKit";

// Every playable character's combat talents and passives, from the first of its skill sets that names them all, as
// `toCharacterTalentKit` reads them, a Traveler's from its Anemo set. A character none of whose sets does is left out
export const getCharacterTalentKits = (): CharacterTalentKit[] => {
  const skillDepotMap = new Map(
    readExcelTable<ExcelSkillDepotRow>("AvatarSkillDepotExcelConfigData").map((row) => [row.id, row]),
  );
  const skillMap = new Map(readExcelTable<ExcelSkillRow>("AvatarSkillExcelConfigData").map((row) => [row.id, row]));
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
