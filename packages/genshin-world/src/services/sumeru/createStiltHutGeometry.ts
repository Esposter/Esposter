import type { StiltHutOptions } from "#src/models/sumeru/StiltHutOptions";
import type { BufferGeometry } from "three";

import { createBoxesGeometry } from "genshin-engine";

const CORNER_SIGNS: [number, number][] = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
];
const FLOOR_THICKNESS = 0.3;
const ROOF_OVERHANG = 0.6;
const ROOF_THICKNESS = 0.4;

// A village hut on stilts as boxes for one material: four posts set in from the corners under a floor, a body of walls
// Standing on it and a roof slab overhanging them. Standing on the origin
export const createStiltHutGeometry = ({
  depth,
  floorHeight,
  postSize,
  width,
  wallHeight,
}: StiltHutOptions): BufferGeometry => {
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const halfPostSize = postSize / 2;
  const wallTop = floorHeight + wallHeight;
  const postBoxes = CORNER_SIGNS.map(([signX, signZ]) => {
    const postX = (signX * (width - postSize)) / 2;
    const postZ = (signZ * (depth - postSize)) / 2;
    return [postX - halfPostSize, 0, postZ - halfPostSize, postX + halfPostSize, floorHeight, postZ + halfPostSize];
  });
  return createBoxesGeometry([
    ...postBoxes,
    [-halfWidth, floorHeight - FLOOR_THICKNESS, -halfDepth, halfWidth, floorHeight, halfDepth],
    [-halfWidth, floorHeight, -halfDepth, halfWidth, wallTop, halfDepth],
    [
      -halfWidth - ROOF_OVERHANG,
      wallTop,
      -halfDepth - ROOF_OVERHANG,
      halfWidth + ROOF_OVERHANG,
      wallTop + ROOF_THICKNESS,
      halfDepth + ROOF_OVERHANG,
    ],
  ]);
};
