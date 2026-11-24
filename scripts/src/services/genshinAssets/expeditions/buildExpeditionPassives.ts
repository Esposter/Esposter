import type { ExcelProudSkillRow } from "#src/models/genshinAssets/stats/ExcelProudSkillRow";
import type { ExpeditionPassive } from "genshin-world";

import { parseExpeditionPassive } from "#src/services/genshinAssets/expeditions/parseExpeditionPassive";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { GameLanguage } from "genshin-text";
import { GameDataset } from "genshin-world/definitions";

// The expedition talents as one record of the expeditions dataset.
// Each utility passive whose English description names an expedition is read by its proud skill group.
// The description is the game's own text.
// A group is read once, from its first row.
export const buildExpeditionPassives = (): Record<string, unknown> => {
  const englishTextMap = readTextMap(GameLanguage.English);
  const passives = new Map<number, ExpeditionPassive>();
  for (const { descTextMapHash, proudSkillGroupId } of readExcelTable<ExcelProudSkillRow>(
    "ProudSkillExcelConfigData",
  )) {
    const description = englishTextMap.get(String(descTextMapHash));
    if (description === undefined || passives.has(proudSkillGroupId)) continue;
    const passive = parseExpeditionPassive(description);
    if (passive) passives.set(proudSkillGroupId, { ...passive, proudSkillGroupId });
  }
  return {
    [`${GameDataset.Expeditions}/passives`]: [...passives.values()].toSorted(
      (firstPassive, secondPassive) => firstPassive.proudSkillGroupId - secondPassive.proudSkillGroupId,
    ),
  };
};
