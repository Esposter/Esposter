import type { ExcelRoleCombatAvatarConfigRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatAvatarConfigRow";
import type { ExcelRoleCombatScheduleRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatScheduleRow";
import type { ImaginariumSeason } from "genshin-world";

import { ElementCodeElementMap } from "#src/services/genshinAssets/imaginarium/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One season from its schedule row and the avatar config row it joins by: its id, the wall-clock moments it begins and ends
// In the game's time zone, the reward Group its Stellas draw from, the difficulties it runs by id, its three elements, and
// The avatar ids of its opening characters and special guests. A code the element map lacks is refused, and the trailing 0,
// Which names no element, is dropped
export const toImaginariumSeason = (
  row: ExcelRoleCombatScheduleRow,
  avatarConfigRow: ExcelRoleCombatAvatarConfigRow,
): ImaginariumSeason => ({
  beginsAt: row.beginTimeStr.replace(" ", "T"),
  difficultyIds: row.LNCBPPGCCOA,
  elements: avatarConfigRow.FMNCKJDCADH.filter((code) => code !== 0).map((code) => {
    const element = ElementCodeElementMap.get(code);
    if (element === undefined)
      throw new InvalidOperationError(
        Operation.Read,
        String(row.scheduleId),
        `names element code ${code}, which the map lacks`,
      );
    return element;
  }),
  endsAt: row.IENPIBICGCC.replace(" ", "T"),
  id: row.scheduleId,
  openingCharacterIds: avatarConfigRow.MFNFDFPOAMC,
  rewardGroup: row.rewardGroupId,
  specialGuestIds: avatarConfigRow.FKFHFHFGMEM,
});
