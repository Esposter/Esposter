import type { ExcelCityLevelupRow } from "#src/models/genshinAssets/statues/ExcelCityLevelupRow";

import { readReward } from "#src/services/genshinAssets/rewards/readReward";
import { readRewardMap } from "#src/services/genshinAssets/rewards/readRewardMap";
import { LIYUE_CITY_ID, MONDSTADT_CITY_ID } from "#src/services/genshinAssets/statues/constants";
import { toStatueLevelRow } from "#src/services/genshinAssets/statues/toStatueLevelRow";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

// Mondstadt's and Liyue's Statue of The Seven levels, each row's reward joined from the reward table, published as one
// Record of the Statue levels dataset a region. An unlisted reward is an error, since a level without its reward would
// Level silently wrong
export const buildStatueLevels = (): Record<string, unknown> => {
  const rewardMap = readRewardMap();
  const levelRows = readExcelTable<ExcelCityLevelupRow>("CityLevelupConfigData");
  return Object.fromEntries(
    Object.entries({ liyue: LIYUE_CITY_ID, mondstadt: MONDSTADT_CITY_ID }).map(([region, cityId]) => [
      `${GameDataset.StatueLevels}/${region}`,
      levelRows
        .filter((levelRow) => levelRow.cityId === cityId)
        .toSorted((firstLevel, secondLevel) => firstLevel.level - secondLevel.level)
        .map((levelRow) =>
          toStatueLevelRow(levelRow, readReward(rewardMap, levelRow.rewardID, `level ${levelRow.level}`)),
        ),
    ]),
  );
};
