import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";

import { readMondstadtExplorationAreas } from "#src/services/exploration/readMondstadtExplorationAreas";
import { getResultAsync } from "@esposter/shared";

// The areas the map counts, read as the world opens: the slice is fetched by its key, and one that fails is logged and
// Left off, so the map shows no progress rather than a wrong one
export const useExplorationAreas = (gameDataBaseUrl: string) => {
  const explorationAreas = shallowRef<ExplorationArea[]>([]);
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => readMondstadtExplorationAreas(gameDataBaseUrl)).match(
    (areas) => {
      explorationAreas.value = areas;
    },
    (error) => {
      console.error(error);
    },
  );
  return explorationAreas;
};
