import type { ExcelCityLevelupRow } from "#src/models/genshinAssets/statues/ExcelCityLevelupRow";

import { readRewardMap } from "#src/services/genshinAssets/rewards/readRewardMap";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import {
  MONDSTADT_CITY_ID,
  MONDSTADT_STATUE_LEVELS_PATH,
  STATUE_LEVELS_GENERATED_DIRECTORY,
} from "#src/services/genshinAssets/statues/constants";
import { toStatueLevelRow } from "#src/services/genshinAssets/statues/toStatueLevelRow";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdirSync, writeFileSync } from "node:fs";

const toJson = (value: unknown): string => `${JSON.stringify(value, undefined, 2)}\n`;
// Mondstadt's Statue of The Seven levels, each row's reward joined from the reward table, written as one slice in the
// World's generated folder. An unlisted reward is an error, since a level without its reward would level silently wrong
export const writeStatueLevels = (): void => {
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
  mkdirSync(STATUE_LEVELS_GENERATED_DIRECTORY, { recursive: true });
  writeFileSync(MONDSTADT_STATUE_LEVELS_PATH, toJson(levels));
};
