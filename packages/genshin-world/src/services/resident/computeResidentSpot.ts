import type { Resident } from "#src/models/world/Resident";
import type { ResidentSpot } from "#src/models/world/ResidentSpot";

import { DAY_END_MINUTES, DAY_START_MINUTES } from "#src/services/resident/constants";

// The spot a resident keeps at a minute of the day, their day spot from six to seven and their night spot the rest of
// The time. Undefined where they keep none in that period, which is how a resident the game shows at one time only is
// Absent at the other
export const computeResidentSpot = ({ day, night }: Resident, minutes: number): ResidentSpot | undefined =>
  minutes >= DAY_START_MINUTES && minutes < DAY_END_MINUTES ? day : night;
