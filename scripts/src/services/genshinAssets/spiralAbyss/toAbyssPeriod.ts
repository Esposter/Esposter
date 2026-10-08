import type { ExcelTowerScheduleRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerScheduleRow";
import type { AbyssPeriod } from "genshin-world";

import { InvalidOperationError, Operation } from "@esposter/shared";

// One period of the Moon Spire from its schedule row: its first set of floors and the moment that set begins, which is the
// Period's start. The later sets are empty in every period the dump holds, so a period with one is refused rather than cut
export const toAbyssPeriod = (row: ExcelTowerScheduleRow): AbyssPeriod => {
  const firstSet = row.EBNNBPCDENK.at(0);
  if (firstSet === undefined || row.EBNNBPCDENK.slice(1).some(({ CPGHMFHHKAD }) => CPGHMFHHKAD.length > 0))
    throw new InvalidOperationError(Operation.Read, String(row.scheduleId), "has more than one set of floors");
  return {
    floorIds: firstSet.CPGHMFHHKAD,
    id: row.scheduleId,
    rewardGroup: row.rewardGroup,
    startsAt: firstSet.HKCLCELNHBI.replace(" ", "T"),
  };
};
