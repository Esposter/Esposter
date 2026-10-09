import type { ExcelOfferingLevelupRow } from "#src/models/genshinAssets/offerings/ExcelOfferingLevelupRow";

import {
  FROSTBEARING_TREE_LEVELS_PATH,
  FROSTBEARING_TREE_OFFERING_ID,
  OFFERING_LEVELS_GENERATED_DIRECTORY,
} from "#src/services/genshinAssets/offerings/constants";
import { toOfferingLevelRow } from "#src/services/genshinAssets/offerings/toOfferingLevelRow";
import { readRewardMap } from "#src/services/genshinAssets/rewards/readRewardMap";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdirSync } from "node:fs";

// The Frostbearing Tree's levels, each row's reward joined from the reward table, written as one slice in the World's
// Generated folder. An unlisted reward is an error, since a level without its reward would level silently wrong
export const writeFrostbearingTreeLevels = (): void => {
  const rewardMap = readRewardMap();
  const levels = readExcelTable<ExcelOfferingLevelupRow>("OfferingLevelUpExcelConfigData")
    .filter(({ offeringId }) => offeringId === FROSTBEARING_TREE_OFFERING_ID)
    .toSorted((firstLevel, secondLevel) => firstLevel.level - secondLevel.level)
    .map((levelRow) => {
      const reward = rewardMap.get(levelRow.rewardId);
      if (!reward)
        throw new InvalidOperationError(
          Operation.Read,
          "offering level",
          `level ${levelRow.level} names reward ${levelRow.rewardId}, which the reward table does not hold`,
        );
      return toOfferingLevelRow(levelRow, reward);
    });
  mkdirSync(OFFERING_LEVELS_GENERATED_DIRECTORY, { recursive: true });
  writeJsonFile(FROSTBEARING_TREE_LEVELS_PATH, levels);
};
