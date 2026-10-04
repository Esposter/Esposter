import type { SceneContext } from "#src/models/scene/SceneContext";

import { InvalidOperationError, Operation } from "@esposter/shared";

// What a sky's colours are solved under, as the scene draws it: its camera's world matrix and inverse projection, so
// Each pixel is a ray, and the sun's and the moon's directions its sky is drawn with
export const getSceneSky = (
  context: SceneContext | undefined,
): {
  matrixWorld: number[];
  moonDirection: [number, number, number];
  projectionMatrixInverse: number[];
  sunDirection: [number, number, number];
} => {
  if (!context?.sky) throw new InvalidOperationError(Operation.Read, "scene", "no sky handed on, or not rendered yet");
  const { camera, sky } = context;
  camera.updateMatrixWorld();
  return {
    matrixWorld: camera.matrixWorld.toArray(),
    moonDirection: sky.moonDirection.value.toArray(),
    projectionMatrixInverse: camera.projectionMatrixInverse.toArray(),
    sunDirection: sky.sunDirection.value.toArray(),
  };
};
