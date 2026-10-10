import type { GaussianHill } from "#src/models/terrain/GaussianHill";
import type { GaussianHills } from "#src/models/terrain/GaussianHills";

import { GAUSSIAN_REACH_WIDTHS } from "#src/terrain/constants";
import { fileByCell } from "#src/terrain/fileByCell";
import { getGaussianHillBlend } from "#src/terrain/getGaussianHillBlend";

// The height of a ground of Gaussian hills at any x and z: its base and every hill reaching that point, each hill filed
// Once under every cell its reach covers, so a point reads one cell's list and draws only the hills whose reach covers it
export const createGaussianHillsHeight = ({ base, hills }: GaussianHills): ((x: number, z: number) => number) => {
  const getHills = fileByCell(hills, ({ width, x, z }: GaussianHill) => {
    const reach = GAUSSIAN_REACH_WIDTHS * width;
    return { maxX: x + reach, maxZ: z + reach, minX: x - reach, minZ: z - reach };
  });
  return (x, z) => {
    let total = base;
    for (const hill of getHills(x, z)) total += hill.height * getGaussianHillBlend(hill, x, z);
    return total;
  };
};
