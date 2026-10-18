import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { ExcelOfferingLevelupRow } from "#src/models/genshinAssets/offerings/ExcelOfferingLevelupRow";

import { OfferingKind } from "#src/models/genshinAssets/offerings/OfferingKind";
import {
  BLAZING_FLINT_ORE_ITEM_ID,
  ENDED_OFFERING_IDS,
  PRIMAL_FLAME_RESONANCE_LEVEL_COUNT,
} from "#src/services/genshinAssets/offerings/constants";
import { OfferingIdKindMap } from "#src/services/genshinAssets/offerings/OfferingIdKindMap";
import { toOfferingLevelRow } from "#src/services/genshinAssets/offerings/toOfferingLevelRow";
import { readRewardMap } from "#src/services/genshinAssets/rewards/readRewardMap";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset } from "genshin-world";

// Every offering's levels, each row's items and reward joined from the level table and the reward table, as one record per
// Offering under its kind. A row at level 0 is the unstarted state and is left out. An offering id the kind map does not
// Hold is an error, since its levels would publish under no key, unless its event has ended. An offering whose level names
// No reward the reward table holds is left out with a note, since its reward is not in the level table. Primal Flame
// Resonance has no level table, so its levels come from the wiki
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
    const offeringRows = allOfferingRows.filter(({ level }) => level > 0);
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
  objects[`${GameDataset.Offerings}/${OfferingKind.PrimalFlameResonance}`] = Array.from(
    { length: PRIMAL_FLAME_RESONANCE_LEVEL_COUNT },
    (_, index) => ({ items: [{ itemCount: 1, itemId: BLAZING_FLINT_ORE_ITEM_ID }], level: index + 1, rewards: [] }),
  );
  notes.push(
    `${OfferingKind.PrimalFlameResonance}: ${PRIMAL_FLAME_RESONANCE_LEVEL_COUNT} levels from the wiki, provisional`,
  );
  return { notes, objects };
};
