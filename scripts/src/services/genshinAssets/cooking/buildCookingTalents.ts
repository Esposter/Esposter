import type { CookProudSkillRow } from "#src/models/genshinAssets/cooking/CookProudSkillRow";
import type { CookingTalent } from "genshin-world";

import { PROUD_SKILL_TABLE_NAME } from "#src/services/genshinAssets/cooking/constants";
import { CookTalentEffectMap } from "#src/services/genshinAssets/cooking/CookTalentEffectMap";
import { toCookingTalent } from "#src/services/genshinAssets/cooking/toCookingTalent";
import { toCookingTalentOwnerMap } from "#src/services/genshinAssets/cooking/toCookingTalentOwnerMap";
import { getCharacterTalentKits } from "#src/services/genshinAssets/stats/getCharacterTalentKits";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset } from "genshin-world";

// The cooking talents of the playable characters, read off the proud skill table: each row whose effect is a cooking one,
// Keyed by the character whose passives open its proud skill group. A talent no character's passives open is an error
export const buildCookingTalents = (): Record<string, unknown> => {
  const characterIdMap = toCookingTalentOwnerMap(getCharacterTalentKits());
  const talentRows = readExcelTable<CookProudSkillRow>(PROUD_SKILL_TABLE_NAME).filter(
    ({ lifeEffectType }) => lifeEffectType !== undefined && CookTalentEffectMap[lifeEffectType] !== undefined,
  );
  const talents = talentRows.map((row): [string, CookingTalent] => {
    const characterId = characterIdMap.get(row.proudSkillGroupId);
    if (characterId === undefined)
      throw new InvalidOperationError(Operation.Read, String(row.proudSkillGroupId), "is named by no character");
    return [String(characterId), toCookingTalent(row)];
  });
  return { [`${GameDataset.Cooking}/talents`]: Object.fromEntries(talents) };
};
