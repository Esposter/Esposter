import type { SceneWitness } from "#src/models/scene/SceneWitness";

import { PerspectiveCamera } from "three";

// The frames drawn after a pose is set before it is read back, for the temporal anti-aliasing's history to settle on it
const SETTLE_FRAME_COUNT = 8;
// A camera pose as the camera solve searches it: the eye in three's axes, its heading about y and its pitch about x in
// Radians, and its vertical field of view in degrees. Alone, the scene draws the witness without its own fog, clouds
// And cloud sea, so a pose is matched on the exports' edges without ours
export interface WitnessCameraPose {
  fov: number;
  isAlone?: boolean;
  pitch: number;
  position: [number, number, number];
  yaw: number;
}
// Sets the camera of the scene the witness is drawn in, which a scene's own props never move while its flight holds,
// And waits for the frames that draw it
export const setWitnessCamera = async (
  { isAlone, parts }: SceneWitness,
  { fov, isAlone: isPoseAlone = false, pitch, position, yaw }: WitnessCameraPose,
): Promise<void> => {
  isAlone.value = isPoseAlone;
  const camera = parts.parent?.children.find((child) => child instanceof PerspectiveCamera);
  if (!(camera instanceof PerspectiveCamera)) return;
  camera.position.set(...position);
  camera.rotation.set(pitch, yaw, 0, "YXZ");
  camera.fov = fov;
  camera.updateProjectionMatrix();
  for (let frame = 0; frame < SETTLE_FRAME_COUNT; frame++)
    // oxlint-disable-next-line no-await-in-loop -- one frame is waited for after another
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => {
        resolve();
      });
    });
};
