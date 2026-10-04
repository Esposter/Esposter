import type { SceneContext } from "#src/models/scene/SceneContext";

import { InvalidOperationError, Operation } from "@esposter/shared";

// What a scene's haze is drawn with, its uniforms' values as the scene sets them, so a tool solving its colours and its
// Density reads the rest as the scene holds them
export const getSceneFog = (
  context: SceneContext | undefined,
): {
  baseHeight: number;
  density: number;
  heightFalloff: number;
  scatterDirection: [number, number, number];
  scatterPower: number;
  scatterStrength: number;
  startDistance: number;
} => {
  if (!context?.fog) throw new InvalidOperationError(Operation.Read, "scene", "no fog handed on, or not rendered yet");
  const { baseHeight, density, heightFalloff, scatterDirection, scatterPower, scatterStrength, startDistance } =
    context.fog;
  return {
    baseHeight: baseHeight.value,
    density: density.value,
    heightFalloff: heightFalloff.value,
    scatterDirection: scatterDirection.value.toArray(),
    scatterPower: scatterPower.value,
    scatterStrength: scatterStrength.value,
    startDistance: startDistance.value,
  };
};
