import type { ChestRange } from "#src/models/chest/ChestRange";

// A count drawn uniformly within a range, both ends included, from the caller's random number
export const drawChestCount = ({ max, min }: ChestRange, random: () => number): number =>
  min + Math.floor(random() * (max - min + 1));
