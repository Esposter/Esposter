import type { LoadBench } from "#parity/models/LoadBench";
import type { SceneContext } from "#src/models/scene/SceneContext";

import { countSceneKinds } from "#parity/countSceneKinds";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { LOAD_STEP_MEASURE_PREFIX } from "#src/services/loading/constants";

// What a screen's load cost from a moment on, read once: each load step's measure and the tiles it rebuilt, the
// Requests and bytes of the game data fetched under its base and of every request, the time the page's long frames held
// The main thread, and the scene's renderer and visible objects as the scene bench counts them. From the page's start it
// Is the load to ready; from a crossing's move, what the crossing cost. A screen with no scene draws none, so its counts
// Are zero
export const benchLoad = (
  context: SceneContext | undefined,
  longFrames: readonly PerformanceEntry[],
  since: number,
): LoadBench => {
  const measures = performance
    .getEntriesByType("measure")
    .filter((entry) => entry instanceof PerformanceMeasure)
    .filter(({ name, startTime }) => name.startsWith(LOAD_STEP_MEASURE_PREFIX) && startTime >= since)
    .map(({ detail, duration, name }) => ({
      duration,
      isFailed: detail?.isFailed === true,
      name: name.slice(LOAD_STEP_MEASURE_PREFIX.length),
      tileCount: typeof detail?.tileCount === "number" ? detail.tileCount : 0,
    }));
  const resources = performance
    .getEntriesByType("resource")
    .filter((entry) => entry instanceof PerformanceResourceTiming)
    .filter(({ startTime }) => startTime >= since);
  const gameDataResources = resources.filter(({ name }) => name.includes(GAME_DATA_LOCAL_BASE_URL));
  const totalBytes = resources.reduce((sum, { transferSize }) => sum + transferSize, 0);
  const gameDataBytes = gameDataResources.reduce((sum, { transferSize }) => sum + transferSize, 0);
  const longFrameMs = longFrames
    .filter(({ startTime }) => startTime >= since)
    .reduce((sum, { duration }) => sum + duration, 0);
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
    longFrameMs,
    measures,
    programs,
    requests: resources.length,
    textures,
    totalBytes,
  };
};
