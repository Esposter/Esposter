import type { ExcelOfferingLevelupRow } from "#src/models/genshinAssets/offerings/ExcelOfferingLevelupRow";

import { FROSTBEARING_TREE_OFFERING_ID } from "#src/services/genshinAssets/offerings/constants";
import { toOfferingLevelRow } from "#src/services/genshinAssets/offerings/toOfferingLevelRow";
import { readRewardMap } from "#src/services/genshinAssets/rewards/readRewardMap";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset } from "genshin-world";

// The Frostbearing Tree's levels, each row's reward joined from the reward table, as one record of the offerings
// Dataset. An unlisted reward is an error, since a level without its reward would level silently wrong
export const buildFrostbearingTreeLevels = (): Record<string, unknown> => {
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
  return { [`${GameDataset.Offerings}/frostbearingTree`]: levels };
};
