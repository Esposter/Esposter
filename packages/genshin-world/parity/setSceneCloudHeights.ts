import type { SceneContext } from "#src/models/scene/SceneContext";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { MathUtils } from "three";

// The heights each band's clouds stand between, by the band's name, or handed back to the scene's own when none are
// Given: a tool reads the cover each placement draws, so each band's heights are solved against the references'. A band
// Scatters its heights evenly between its own, so carrying each cloud's height linearly from those to the given stands
// It where placing the band between the given would, every other draw of its scatter kept, save that the cloud sea keeps
// The clouds its own heights kept clear of the walkway, each held under its ceiling so none the given heights raise
// Stands in the walkway. The first call keeps the scene's own heights, and each band's own range is handed back by its
// Name
export const setSceneCloudHeights = (
  context: SceneContext | undefined,
  heights?: Record<string, [number, number]>,
): Record<string, [number, number]> => {
  if (!context) throw new InvalidOperationError(Operation.Read, "scene", "the scene has not rendered yet");
  const ownRanges: Record<string, [number, number]> = {};
  context.scene.traverse((object) => {
    const places = object.userData.places as [number, number, number][] | undefined;
    const ceilings = object.userData.ceilings as number[] | undefined;
    const ownRange = object.userData.heightRange as [number, number] | undefined;
    if (!places || !ownRange) return;
    object.userData.ownHeights ??= places.map(([, height]) => height);
    const ownHeights = object.userData.ownHeights as number[];
    const [low, high] = heights?.[object.name] ?? ownRange;
    for (const [index, place] of places.entries())
      place[1] = Math.min(
        MathUtils.mapLinear(ownHeights[index] ?? 0, ownRange[0], ownRange[1], low, high),
        ceilings?.[index] ?? Infinity,
      );
    ownRanges[object.name] = ownRange;
  });
  return ownRanges;
};
