import type { WorldPlacement } from "#src/models/genshinAssets/world/WorldPlacement";
import type { GroundPoint } from "genshin-engine";

import { CAPITAL_VIEW_METRES } from "#src/services/genshinAssets/world/constants";

// Whether a placement stands within the square a capital is viewed across, round its place in the game's axes
export const checkIsInView = (
  { position: [x, , z] }: WorldPlacement,
  { x: centerX, z: centerZ }: GroundPoint,
): boolean => Math.abs(x - centerX) <= CAPITAL_VIEW_METRES && Math.abs(z - centerZ) <= CAPITAL_VIEW_METRES;
