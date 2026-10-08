import type { CookingZones } from "#src/models/cooking/CookingZones";

import { CookingQuality } from "#src/models/cooking/CookingQuality";

// The quality of a dish cooked by hand from where the indicator stopped on the bar: the delicious zone makes a Delicious
// Dish, the regular zone a Regular one, and anywhere else a Suspicious one
export const getCookingQuality = (stopPosition: number, { delicious, regular }: CookingZones): CookingQuality => {
  if (stopPosition >= delicious[0] && stopPosition <= delicious[1]) return CookingQuality.Delicious;
  if (stopPosition >= regular[0] && stopPosition <= regular[1]) return CookingQuality.Regular;
  return CookingQuality.Suspicious;
};
