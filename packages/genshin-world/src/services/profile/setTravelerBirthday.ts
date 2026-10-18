import type { TravelerBirthdaySave } from "#src/models/save/TravelerBirthdaySave";

import { getBirthdayDayCount } from "#src/services/profile/getBirthdayDayCount";

// The Traveler's birthday is set once: a held one is kept, and a chosen date is set only when it exists in its month
export const setTravelerBirthday = (
  held: TravelerBirthdaySave | undefined,
  chosen: TravelerBirthdaySave,
): TravelerBirthdaySave | undefined => {
  if (held) return held;
  return chosen.day <= getBirthdayDayCount(chosen.month) ? chosen : undefined;
};
