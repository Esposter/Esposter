import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { ExcelOfferingLevelupRow } from "#src/models/genshinAssets/offerings/ExcelOfferingLevelupRow";

import { OfferingIdKindMap } from "#src/services/genshinAssets/offerings/OfferingIdKindMap";
import { getConsumedItems } from "#src/services/genshinAssets/offerings/getConsumedItems";
import { toOfferingLevelRow } from "#src/services/genshinAssets/offerings/toOfferingLevelRow";
import { readRewardMap } from "#src/services/genshinAssets/rewards/readRewardMap";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset } from "genshin-world";

// Every offering's levels, each row's reward joined from the reward table, as one record per offering under its kind. A
// Row at level 0 is the offering's unstarted state, which names no level and is left out. An offering id the kind map does
// Not hold is an error, since its levels would publish under no key. An offering whose level takes two items, or names no
// Reward its table holds, is left out with a note, since a level holds one item and a reward it does not name pays nothing
export const buildOfferingLevels = (): GameDataBuild => {
  const rewardMap = readRewardMap();
  const levelRows = readExcelTable<ExcelOfferingLevelupRow>("OfferingLevelUpExcelConfigData");
  const notes: string[] = [];
  const objects: Record<string, unknown> = {};
  for (const [offeringId, allOfferingRows] of Map.groupBy(levelRows, (levelRow) => levelRow.offeringId)) {
    const kind = OfferingIdKindMap[offeringId];
    if (kind === undefined)
      throw new InvalidOperationError(
        Operation.Read,
        "offering",
        `offering ${offeringId} is not in the offering kind map`,
      );
    const offeringRows = allOfferingRows.filter(({ level }) => level > 0);
    if (offeringRows.some((levelRow) => getConsumedItems(levelRow).length > 1)) {
      notes.push(`${kind}: left out, a level takes two items and holds one`);
      continue;
    }
    if (offeringRows.some(({ rewardId }) => rewardId === 0)) {
      notes.push(`${kind}: left out, a level names no reward the level table holds`);
      continue;
    }
    objects[`${GameDataset.Offerings}/${kind}`] = offeringRows
      .toSorted((firstLevel, secondLevel) => firstLevel.level - secondLevel.level)
      .map((levelRow) => {
        const reward = rewardMap.get(levelRow.rewardId);
        if (!reward)
          throw new InvalidOperationError(
            Operation.Read,
            "offering level",
            `level ${levelRow.level} of ${kind} names reward ${levelRow.rewardId}, which the reward table does not hold`,
          );
        return toOfferingLevelRow(levelRow, reward);
      });
    notes.push(`${kind}: ${offeringRows.length} levels`);
  }
  return { notes, objects };
};
