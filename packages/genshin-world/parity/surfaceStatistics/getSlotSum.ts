import { SURFACE_STATISTICS_PARTIAL_COUNT } from "#parity/surfaceStatistics/constants";

// The sum of one slot's partials, added up in double precision
export const getSlotSum = (partialSums: Float32Array, slot: number): number => {
  let total = 0;
  for (let index = 0; index < SURFACE_STATISTICS_PARTIAL_COUNT; index++)
    total += partialSums[slot * SURFACE_STATISTICS_PARTIAL_COUNT + index] ?? 0;
  return total;
};
