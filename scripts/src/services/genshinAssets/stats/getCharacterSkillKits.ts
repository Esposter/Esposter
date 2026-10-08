import type { ExcelAvatarRow } from "#src/models/genshinAssets/stats/ExcelAvatarRow";
import type { ExcelSkillDepotRow } from "#src/models/genshinAssets/stats/ExcelSkillDepotRow";
import type { ExcelSkillRow } from "#src/models/genshinAssets/stats/ExcelSkillRow";
import type { CharacterSkillKit } from "genshin-world";

import { PLAYABLE_AVATAR_USE_TYPE } from "#src/services/genshinAssets/stats/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { toSkillDepot } from "#src/services/genshinAssets/stats/toSkillDepot";
import { characterSkillKitSchema } from "genshin-world";

// Every playable character's skill sets, its own form's first and then each element form's, as the game's tables give
// Them. A character none of whose sets holds a skill or a burst is left out
export const getCharacterSkillKits = (): CharacterSkillKit[] => {
  const skillDepotMap = new Map(
    readExcelTable<ExcelSkillDepotRow>("AvatarSkillDepotExcelConfigData").map((row) => [row.id, row]),
  );
  const skillMap = new Map(readExcelTable<ExcelSkillRow>("AvatarSkillExcelConfigData").map((row) => [row.id, row]));
  return readExcelTable<ExcelAvatarRow>("AvatarExcelConfigData")
    .filter(({ useType }) => useType === PLAYABLE_AVATAR_USE_TYPE)
    .map(({ candSkillDepotIds, id, skillDepotId }) => ({
      characterId: id,
      depots: [...new Set([skillDepotId, ...candSkillDepotIds])].flatMap((depotId) => {
        const depotRow = skillDepotMap.get(depotId);
        const skillDepot = depotRow === undefined ? undefined : toSkillDepot(depotRow, skillMap);
        return skillDepot === undefined ? [] : [skillDepot];
      }),
    }))
    .filter(({ depots }) => depots.length > 0)
    .map((characterSkillKit) => characterSkillKitSchema.parse(characterSkillKit));
};
