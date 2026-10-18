import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";

import { checkIsCommissionFinished } from "#src/services/commission/checkIsCommissionFinished";
import { ENCOUNTER_POINT_STORAGE, HALF_POINTS_PER_ENCOUNTER_POINT } from "#src/services/commission/constants";

// The half points the storage holds: four Encounter Points, less one for each daily commission finished that day. A day
// With no slice read finishes none, since a finished commission is one the slice names
export const computeEncounterPointStorage = (day: CommissionDay, slice: CommissionSlice | undefined): number => {
  const finishedCount = day.dealtCommissions.filter((progress) => {
    const commission = slice?.tasks.find(({ id }) => id === progress.commissionId);
    return commission !== undefined && checkIsCommissionFinished(progress, commission);
  }).length;
  return Math.max(0, ENCOUNTER_POINT_STORAGE - finishedCount) * HALF_POINTS_PER_ENCOUNTER_POINT;
};
