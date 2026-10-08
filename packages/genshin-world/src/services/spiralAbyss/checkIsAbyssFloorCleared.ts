import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";
import type { AbyssProgress } from "#src/models/spiralAbyss/AbyssProgress";

// Whether all three of a floor's chambers have been cleared in a cycle
export const checkIsAbyssFloorCleared = (floor: AbyssFloor, progress: AbyssProgress): boolean =>
  floor.chambers.every(({ id }) => progress.chamberIdProgressMap.get(id)?.isCleared === true);
