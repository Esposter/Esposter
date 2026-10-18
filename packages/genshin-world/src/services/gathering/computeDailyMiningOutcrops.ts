import { MINING_OUTCROP_DAILY_COUNT_MAP, MINING_OUTCROP_DEFAULT_DAILY_COUNT } from "#src/services/gathering/constants";
import { checkIsMiningOutcropOpen } from "#src/services/leyLine/checkIsMiningOutcropOpen";
import { drawPlaceIds } from "#src/services/leyLine/drawPlaceIds";

// The mining outcrops a region's daily reset draws: the region's count of its places, each drawn afresh from the places
// Not yet drawn, and none below Adventure Rank 30. A region with fewer places than its count draws every place it has
export const computeDailyMiningOutcrops = (
  regionId: string,
  placeIds: readonly string[],
  adventureRank: number,
  random: () => number,
): string[] => {
  if (!checkIsMiningOutcropOpen(adventureRank)) return [];
  const count = MINING_OUTCROP_DAILY_COUNT_MAP[regionId] ?? MINING_OUTCROP_DEFAULT_DAILY_COUNT;
  return drawPlaceIds(placeIds, count, random);
};
