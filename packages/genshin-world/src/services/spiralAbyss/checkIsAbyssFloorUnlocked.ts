import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";
import type { AbyssProgress } from "#src/models/spiralAbyss/AbyssProgress";

import { checkIsAbyssFloorCleared } from "#src/services/spiralAbyss/checkIsAbyssFloorCleared";
import { computeAbyssFloorStars } from "#src/services/spiralAbyss/computeAbyssFloorStars";

// Whether the floor above `previousFloor` is open in a cycle: the floor below has all three chambers cleared and the stars
// Its unlock count names. The first floor has none below it, so it is always open
export const checkIsAbyssFloorUnlocked = (previousFloor: AbyssFloor | undefined, progress: AbyssProgress): boolean =>
  previousFloor === undefined ||
  (checkIsAbyssFloorCleared(previousFloor, progress) &&
    computeAbyssFloorStars(previousFloor, progress) >= previousFloor.unlockStarCount);
