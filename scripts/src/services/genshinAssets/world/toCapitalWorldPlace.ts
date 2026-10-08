import type { GroundPoint } from "genshin-engine";

// A capital's place in the game's axes, from its place round the world's origin the way a region's data holds it: the
// Origin's x plus the place's x, and the origin's z less the place's z, since a region's z runs the mirror of the game's
export const toCapitalWorldPlace = (
  { x, z }: GroundPoint,
  [originX, , originZ]: readonly [number, number, number],
): GroundPoint => ({ x: originX + x, z: originZ - z });
