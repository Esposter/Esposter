import type { Resident } from "#src/models/world/Resident";
import type { ResidentSpot } from "#src/models/world/ResidentSpot";

import { DAY_END_MINUTES, DAY_START_MINUTES } from "#src/services/resident/constants";

// The spot a resident keeps at a minute of the day, their day spot from six to seven and the rest of the night their night
// Spot, or their day spot when they have none. Undefined in the night only where the data says they are absent then, and
// Undefined in the day where they keep no day spot
export const computeResidentSpot = (
  { absentAtNight, day, night }: Resident,
  minutes: number,
): ResidentSpot | undefined => {
  if (minutes >= DAY_START_MINUTES && minutes < DAY_END_MINUTES) return day;
  if (absentAtNight) return undefined;

  return night || day;
};
