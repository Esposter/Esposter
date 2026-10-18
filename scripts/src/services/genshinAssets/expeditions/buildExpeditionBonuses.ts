import type { ExcelExpeditionBonusRow } from "#src/models/genshinAssets/expeditions/ExcelExpeditionBonusRow";

import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

// The chance of an expedition bonus by the level of the character sent, as one record of the Expeditions dataset
export const buildExpeditionBonuses = (): Record<string, unknown> => {
  const bonuses = readExcelTable<ExcelExpeditionBonusRow>("ExpeditionBonusExcelConfigData")
    .map(({ avatarLevel, probability }) => ({ avatarLevel, probability }))
    .toSorted((firstBonus, secondBonus) => firstBonus.avatarLevel - secondBonus.avatarLevel);
  return { [`${GameDataset.Expeditions}/bonuses`]: bonuses };
};
