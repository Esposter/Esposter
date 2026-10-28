import type { GameDataLock } from "genshin-world";

import { compareCodeUnits } from "#src/services/shared/compareCodeUnits";

// The lock as it is committed: keys sorted and one entry a line, so a patch's diff names exactly the keys it changed
// And two machines that publish the same records write the same bytes
export const formatGameDataLock = (lock: GameDataLock): string =>
  `${JSON.stringify(
    {
      indexes: Object.fromEntries(
        Object.entries(lock.indexes).toSorted(([left], [right]) => compareCodeUnits(left, right)),
      ),
      objects: Object.fromEntries(
        Object.entries(lock.objects).toSorted(([left], [right]) => compareCodeUnits(left, right)),
      ),
    },
    null,
    2,
  )}\n`;
