import type { GroundPoint } from "genshin-engine";

import { ARCHITECTURE_VIEW_METRES } from "#src/services/genshinAssets/world/constants";

// Whether a point stands within the architecture radius of a capital's place, round it in the game's axes
export const checkIsInArchitectureView = (
  [x, , z]: readonly [number, number, number],
  { x: centerX, z: centerZ }: GroundPoint,
): boolean => Math.hypot(x - centerX, z - centerZ) <= ARCHITECTURE_VIEW_METRES;
