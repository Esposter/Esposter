import type { OutcropRegion } from "genshin-world";

import { GameDataset } from "genshin-world";

// Each city's ley line outcrop region as one record under the key its city's id names, the key the world reads it by
export const buildLeyLineRegions = (regions: Map<number, OutcropRegion>): Record<string, unknown> =>
  Object.fromEntries(Array.from(regions, ([cityId, region]) => [`${GameDataset.LeyLine}/regions/${cityId}`, region]));
