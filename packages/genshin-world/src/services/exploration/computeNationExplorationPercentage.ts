import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";
import type { Landmark } from "#src/models/world/Landmark";

import { computeDoneWeight } from "#src/services/exploration/computeDoneWeight";
import { computeExplorationProgress } from "#src/services/exploration/computeExplorationProgress";
import { computeExploredDoingIds } from "#src/services/exploration/computeExploredDoingIds";

// A nation's exploration as the map shows it. Where the areas carry their reputation ratios, each area's share of its total
// Counts for its ratio of the nation, rounded down once at the end. Where every ratio is zero, the areas read as one area
// Holding every doing over their summed totals, so the done weight rounds down the way an area's own share does
export const computeNationExplorationPercentage = (
  areas: readonly ExplorationArea[],
  unlockedLandmarks: readonly Landmark[],
): number => {
  if (areas.every(({ reputationRatio }) => reputationRatio === 0))
    return computeExplorationProgress(
      { doings: areas.flatMap(({ doings }) => doings), total: areas.reduce((sum, { total }) => sum + total, 0) },
      new Set(areas.flatMap((area) => [...computeExploredDoingIds(area, unlockedLandmarks)])),
    );
  const percentage = areas.reduce((sum, area) => {
    const doneWeight = computeDoneWeight(area.doings, computeExploredDoingIds(area, unlockedLandmarks));
    return sum + (area.reputationRatio * doneWeight * 100) / area.total;
  }, 0);
  return Math.min(Math.floor(percentage), 100);
};
