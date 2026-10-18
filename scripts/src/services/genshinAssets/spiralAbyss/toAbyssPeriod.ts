import type { ExcelTowerScheduleRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerScheduleRow";
import type { AbyssPeriod } from "genshin-world";

import { InvalidOperationError, Operation } from "@esposter/shared";

// One period of the Moon Spire from its schedule row: its first set of floors and the moment that set begins, which is the
// Period's start, the moment the row closes, and its blessing. The later sets are empty in every period the dump holds, so a
// Period with one is refused rather than cut. An empty later set is written with no fields at this patch, so an absent list
// Reads as empty there, while a first set missing its floors or its moment is refused, since a period cannot start at no time
export const toAbyssPeriod = (row: ExcelTowerScheduleRow): AbyssPeriod => {
  const firstSet = row.LHOGNLPBILP.at(0);
  if (firstSet === undefined || row.LHOGNLPBILP.slice(1).some(({ EFPMEPJHIKD = [] }) => EFPMEPJHIKD.length > 0))
    throw new InvalidOperationError(Operation.Read, String(row.scheduleId), "has more than one set of floors");
  if (firstSet.EFPMEPJHIKD === undefined || firstSet.EHNDJIHDENA === undefined)
    throw new InvalidOperationError(
      Operation.Read,
      String(row.scheduleId),
      "has a first set with no floors or no start",
    );
  return {
    blessing: { descriptionTextHash: row.descTextMapHash, icon: row.icon, nameTextHash: row.buffnameTextMapHash },
    closesAt: row.closeTime.replace(" ", "T"),
    floorIds: firstSet.EFPMEPJHIKD,
    id: row.scheduleId,
    rewardGroup: row.rewardGroup,
    startsAt: firstSet.EHNDJIHDENA.replace(" ", "T"),
  };
};
