import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";
import type { Landmark } from "#src/models/world/Landmark";

import { computeExplorationProgress } from "#src/services/exploration/computeExplorationProgress";
import { computeExploredDoingIds } from "#src/services/exploration/computeExploredDoingIds";

// A nation's exploration as the map shows it: its areas read as one area, holding every doing they count over their
// Summed totals, so the done weight rounds down the way an area's own share does. Mondstadt's ratios all read 0, so its
// Percentage takes the summed totals; a nation whose ratios are set waits on a slice that carries them
export const computeNationExplorationPercentage = (
  areas: readonly ExplorationArea[],
  unlockedLandmarks: readonly Landmark[],
): number =>
  computeExplorationProgress(
    { doings: areas.flatMap(({ doings }) => doings), total: areas.reduce((sum, { total }) => sum + total, 0) },
    new Set(areas.flatMap((area) => [...computeExploredDoingIds(area, unlockedLandmarks)])),
  );
