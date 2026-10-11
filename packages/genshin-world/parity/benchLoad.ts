import type { LoadBench } from "#parity/models/LoadBench";
import type { SceneContext } from "#src/models/scene/SceneContext";

import { countSceneKinds } from "#parity/countSceneKinds";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { LOAD_STEP_MEASURE_PREFIX } from "#src/services/loading/constants";

// What a screen's load cost at ready, read once: each load step's measure, the requests and bytes of the game data
// Fetched under its base and of every request, and the scene's renderer and visible objects as the scene bench counts
// Them. A screen with no scene at ready draws none, so its counts are zero
export const benchLoad = (context: SceneContext | undefined): LoadBench => {
  const measures = performance
    .getEntriesByType("measure")
    .filter((entry) => entry instanceof PerformanceMeasure)
    .filter(({ name }) => name.startsWith(LOAD_STEP_MEASURE_PREFIX))
    .map(({ detail, duration, name }) => ({
      duration,
      isFailed: detail?.isFailed === true,
      name: name.slice(LOAD_STEP_MEASURE_PREFIX.length),
    }));
  const resources = performance
    .getEntriesByType("resource")
    .filter((entry) => entry instanceof PerformanceResourceTiming);
  const gameDataResources = resources.filter(({ name }) => name.includes(GAME_DATA_LOCAL_BASE_URL));
  const totalBytes = resources.reduce((sum, { transferSize }) => sum + transferSize, 0);
  const gameDataBytes = gameDataResources.reduce((sum, { transferSize }) => sum + transferSize, 0);
  const { geometries, programs, textures } = context?.renderer.info.memory ?? {
    geometries: 0,
    programs: 0,
    textures: 0,
  };
  return {
    gameDataBytes,
    gameDataRequests: gameDataResources.length,
    geometries,
    kindCounts: context ? countSceneKinds(context.scene) : {},
    measures,
    programs,
    requests: resources.length,
    textures,
    totalBytes,
  };
};
