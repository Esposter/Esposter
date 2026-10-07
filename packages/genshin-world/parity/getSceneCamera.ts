import type { WitnessView } from "#parity/models/witness/WitnessView";
import type { SceneContext } from "#src/models/scene/SceneContext";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { Euler, PerspectiveCamera, Vector3 } from "three";

// The camera the scene draws from, as a witness view poses one, which the camera pass projects a reference's
// Landmarks from
export const getSceneCamera = (context: SceneContext | undefined): NonNullable<WitnessView["camera"]> => {
  if (!(context?.camera instanceof PerspectiveCamera))
    throw new InvalidOperationError(Operation.Read, "scene", "no perspective camera handed on, or not rendered yet");
  const { camera } = context;
  camera.updateMatrixWorld();
  const { x: pitch, y: yaw } = new Euler().setFromRotationMatrix(camera.matrixWorld, "YXZ");
  const position = new Vector3().setFromMatrixPosition(camera.matrixWorld).toArray();
  return { fov: camera.fov, pitch, position, yaw };
};
