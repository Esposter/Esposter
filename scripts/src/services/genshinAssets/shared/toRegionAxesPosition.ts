import type { GroundPoint } from "genshin-engine";

// Where a game position stands in a region's axes round the origin's place, as a region's other places do: its x less the
// Origin's, its z the origin's less the game's. Unrounded, so each caller rounds it where the place is stored
export const toRegionAxesPosition = (
  position: GroundPoint,
  [originX, , originZ]: readonly [number, number, number],
): GroundPoint => ({ x: position.x - originX, z: originZ - position.z });
