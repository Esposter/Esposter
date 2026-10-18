import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { ExcelOfferingLevelupRow } from "#src/models/genshinAssets/offerings/ExcelOfferingLevelupRow";
import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

import { OfferingKind } from "#src/models/genshinAssets/offerings/OfferingKind";
import {
  BLAZING_FLINT_ORE_ITEM_ID,
  ENDED_OFFERING_IDS,
  OFFERING_REWARD_POOL_IDS,
  PRIMAL_FLAME_RESONANCE_LEVEL_COUNT,
} from "#src/services/genshinAssets/offerings/constants";
import { OfferingIdKindMap } from "#src/services/genshinAssets/offerings/OfferingIdKindMap";
import { toOfferingLevelRow } from "#src/services/genshinAssets/offerings/toOfferingLevelRow";
import { toPoolOfferingLevelRow } from "#src/services/genshinAssets/offerings/toPoolOfferingLevelRow";
import { readRewardMap } from "#src/services/genshinAssets/rewards/readRewardMap";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset } from "genshin-world";

// A reward row the reward table must hold, read for the level or the pool that names it
const readReward = (
  rewardMap: ReadonlyMap<number, ExcelRewardRow>,
  rewardId: number,
  named: string,
): ExcelRewardRow => {
  const reward = rewardMap.get(rewardId);
  if (!reward)
    throw new InvalidOperationError(
      Operation.Read,
      "offering reward",
      `${named} names reward ${rewardId}, which the reward table does not hold`,
    );
  return reward;
};

// Every offering's levels, each row's items and reward joined from the level table and the reward table, as one record per
// Offering under its kind. A row at level 0 is the unstarted state and is left out. An offering id the kind map does not
// Hold is an error, since its levels would publish under no key, unless its event has ended. An offering whose levels name
// Their rewards in a pool rather than the level table draws each level from that pool. An offering whose level names no
// Reward the level table holds is left out with a note. Primal Flame Resonance has no level table, so its levels come from
// The wiki
export const buildOfferingLevels = (): GameDataBuild => {
  const rewardMap = readRewardMap();
  const levelRows = readExcelTable<ExcelOfferingLevelupRow>("OfferingLevelUpExcelConfigData");
  const notes: string[] = [];
  const objects: Record<string, unknown> = {};
  for (const [offeringId, allOfferingRows] of Map.groupBy(levelRows, (levelRow) => levelRow.offeringId)) {
    if (ENDED_OFFERING_IDS.has(offeringId)) {
      notes.push(`offering ${offeringId}: left out, its event has ended`);
      continue;
    }
    const kind = OfferingIdKindMap[offeringId];
    if (kind === undefined)
      throw new InvalidOperationError(
        Operation.Read,
        "offering",
        `offering ${offeringId} is not in the offering kind map`,
      );
    const offeringRows = allOfferingRows
      .filter(({ level }) => level > 0)
      .toSorted((firstLevel, secondLevel) => firstLevel.level - secondLevel.level);
    const poolRewardIds = OFFERING_REWARD_POOL_IDS.get(offeringId);
    if (poolRewardIds) {
      const poolRewards = poolRewardIds.map((rewardId) => readReward(rewardMap, rewardId, `${kind}'s pool`));
      objects[`${GameDataset.Offerings}/${kind}`] = offeringRows.map((levelRow) =>
        toPoolOfferingLevelRow(levelRow, poolRewards),
      );
      notes.push(`${kind}: ${offeringRows.length} levels, each drawing one of ${poolRewards.length} reward sets`);
      continue;
    }
    if (offeringRows.some(({ rewardId }) => rewardId === 0)) {
      notes.push(`${kind}: left out, a level names no reward the level table holds`);
      continue;
    }
    objects[`${GameDataset.Offerings}/${kind}`] = offeringRows.map((levelRow) =>
      toOfferingLevelRow(levelRow, readReward(rewardMap, levelRow.rewardId, `level ${levelRow.level} of ${kind}`)),
    );
    notes.push(`${kind}: ${offeringRows.length} levels`);
  }
  objects[`${GameDataset.Offerings}/${OfferingKind.PrimalFlameResonance}`] = Array.from(
    { length: PRIMAL_FLAME_RESONANCE_LEVEL_COUNT },
    (_value, index) => ({
      items: [{ itemCount: 1, itemId: BLAZING_FLINT_ORE_ITEM_ID }],
      level: index + 1,
      reward: { kind: "fixed", rewards: [] },
    }),
  );
  notes.push(
    `${OfferingKind.PrimalFlameResonance}: ${PRIMAL_FLAME_RESONANCE_LEVEL_COUNT} levels from the wiki, provisional`,
  );
  return { notes, objects };
};
