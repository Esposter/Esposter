import type { CharacterSkillKit } from "genshin-world";

import { readPlayableAvatarRows } from "#src/services/genshinAssets/stats/readPlayableAvatarRows";
import { readSkillDepotMap } from "#src/services/genshinAssets/stats/readSkillDepotMap";
import { readSkillMap } from "#src/services/genshinAssets/stats/readSkillMap";
import { toSkillDepot } from "#src/services/genshinAssets/stats/toSkillDepot";
import { characterSkillKitSchema } from "genshin-world";

// Every playable character's skill sets, its own form's first and then each element form's, as the game's tables give
// Them. A character none of whose sets holds a skill or a burst is left out
export const getCharacterSkillKits = (): CharacterSkillKit[] => {
  const skillDepotMap = readSkillDepotMap();
  const skillMap = readSkillMap();
  return readPlayableAvatarRows()
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
