import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";
import type { AbyssProgress } from "#src/models/spiralAbyss/AbyssProgress";

// The stars a floor holds in a cycle: the best each of its chambers has earned, summed. A chamber never tried holds none
export const computeAbyssFloorStars = (floor: AbyssFloor, progress: AbyssProgress): number =>
  floor.chambers.reduce((stars, { id }) => stars + (progress.chamberIdProgressMap.get(id)?.stars ?? 0), 0);
