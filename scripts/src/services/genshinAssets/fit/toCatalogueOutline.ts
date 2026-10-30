import type { GroundPoint } from "genshin-engine";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";

// A game outline carried into the catalogue's axes round the origin the world is set round (`readWorldOrigin`).
// Each corner's x is its x less the origin's, and its z is taken from the origin's, to the metre.
export const toCatalogueOutline = (
  { roadPoints }: { roadPoints: readonly GroundPoint[] },
  [originX, , originZ]: readonly [number, number, number],
): GroundPoint[] => roadPoints.map(({ x, z }) => ({ x: roundFitted(x - originX, 0), z: roundFitted(originZ - z, 0) }));
