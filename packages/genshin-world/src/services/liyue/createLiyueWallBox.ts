import type { LiyueWallBoxOptions } from "#src/models/liyue/LiyueWallBoxOptions";

// A box in a wall's plane, as createBoxesGeometry takes it: [minX, minY, minZ, maxX, maxY, maxZ]
export const createLiyueWallBox = ({
  bottom,
  end,
  face,
  isAlongX,
  start,
  thickness,
  top,
}: LiyueWallBoxOptions): number[] => {
  const half = thickness / 2;
  return isAlongX
    ? [start, bottom, face - half, end, top, face + half]
    : [face - half, bottom, start, face + half, top, end];
};
