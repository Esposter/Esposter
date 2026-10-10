import type { ExcelCityLevelupRow } from "#src/models/genshinAssets/statues/ExcelCityLevelupRow";

import { readRewardMap } from "#src/services/genshinAssets/rewards/readRewardMap";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { MONDSTADT_CITY_ID } from "#src/services/genshinAssets/statues/constants";
import { toStatueLevelRow } from "#src/services/genshinAssets/statues/toStatueLevelRow";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset } from "genshin-world";

// Mondstadt's Statue of The Seven levels, each row's reward joined from the reward table, published as one record of the
// Statue levels dataset. An unlisted reward is an error, since a level without its reward would level silently wrong
export const buildStatueLevels = (): Record<string, unknown> => {
  const rewardMap = readRewardMap();
  const levels = readExcelTable<ExcelCityLevelupRow>("CityLevelupConfigData")
    .filter(({ cityId }) => cityId === MONDSTADT_CITY_ID)
    .toSorted((firstLevel, secondLevel) => firstLevel.level - secondLevel.level)
    .map((levelRow) => {
      const reward = rewardMap.get(levelRow.rewardID);
      if (!reward)
        throw new InvalidOperationError(
          Operation.Read,
          "statue level",
          `level ${levelRow.level} names reward ${levelRow.rewardID}, which the reward table does not hold`,
        );
      return toStatueLevelRow(levelRow, reward);
    });
  return { [`${GameDataset.StatueLevels}/mondstadt`]: levels };
};
