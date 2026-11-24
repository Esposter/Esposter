import type { ExcelRoleCombatAvatarConfigRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatAvatarConfigRow";
import type { ExcelRoleCombatScheduleRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatScheduleRow";
import type { ExcelTrialAvatarRow } from "#src/models/genshinAssets/trials/ExcelTrialAvatarRow";
import type { ImaginariumSeason } from "genshin-world";

import { ElementCodeElementMap } from "#src/services/genshinAssets/imaginarium/constants";
import { toImaginariumOpeningTrials } from "#src/services/genshinAssets/imaginarium/toImaginariumOpeningTrials";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One season from its schedule row and the avatar config row it joins by: its id, the wall-clock moments it begins and
// Ends in the game's time zone, the reward Group its Stellas draw from, the difficulties it runs by id, its three
// Elements, the avatar ids of its opening characters and special guests, and the trial avatars its openers play as,
// Read from the trial table. A code the element map lacks is refused, and the trailing 0, which names no element, is
// Dropped
export const toImaginariumSeason = (
  row: ExcelRoleCombatScheduleRow,
  avatarConfigRow: ExcelRoleCombatAvatarConfigRow,
  trialAvatarRowMap: Map<number, ExcelTrialAvatarRow>,
): ImaginariumSeason => ({
  beginsAt: row.beginTimeStr.replace(" ", "T"),
  difficultyIds: row.difficultyIds,
  elements: avatarConfigRow.elementCodes
    .filter((code) => code !== 0)
    .map((code) => {
      const element = ElementCodeElementMap.get(code);
      if (element === undefined)
        throw new InvalidOperationError(
          Operation.Read,
          String(row.scheduleId),
          `names element code ${code}, which the map lacks`,
        );
      return element;
    }),
  endsAt: row.endTimeStr.replace(" ", "T"),
  id: row.scheduleId,
  openingCharacterIds: avatarConfigRow.openingCharacterIds,
  openingTrials: toImaginariumOpeningTrials(avatarConfigRow.openingTrialIds, trialAvatarRowMap),
  rewardGroup: row.rewardGroupId,
  specialGuestIds: avatarConfigRow.specialGuestIds,
});
