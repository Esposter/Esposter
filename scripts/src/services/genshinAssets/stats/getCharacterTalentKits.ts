import type { ExcelProudSkillRow } from "#src/models/genshinAssets/stats/ExcelProudSkillRow";
import type { CharacterTalentKit } from "genshin-world";

import { getCharacterSkillDepotRows } from "#src/services/genshinAssets/stats/getCharacterSkillDepotRows";
import { readPlayableAvatarRows } from "#src/services/genshinAssets/stats/readPlayableAvatarRows";
import { readSkillDepotMap } from "#src/services/genshinAssets/stats/readSkillDepotMap";
import { readSkillMap } from "#src/services/genshinAssets/stats/readSkillMap";
import { toCharacterTalentKit } from "#src/services/genshinAssets/stats/toCharacterTalentKit";
import { toProudSkillNameTextIdMap } from "#src/services/genshinAssets/stats/toProudSkillNameTextIdMap";

// Every playable character's combat talents and passives, from the first of its skill sets that names them all, as
// `toCharacterTalentKit` reads them, a Traveler's from its Anemo set. A character none of whose sets does is left out.
// The caller reads the proud skill table once and hands its rows in, since the passives' names come off the same rows it
// Reads the talents' tables from
export const getCharacterTalentKits = (proudSkillRows: readonly ExcelProudSkillRow[]): CharacterTalentKit[] => {
  const skillDepotMap = readSkillDepotMap();
  const skillMap = readSkillMap();
  const proudSkillNameTextIdMap = toProudSkillNameTextIdMap(proudSkillRows);
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
