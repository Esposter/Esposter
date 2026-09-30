import type { SceneWitness } from "#src/models/scene/SceneWitness";

import { WitnessShading } from "#parity/witness/WitnessShading";
import { Mesh, PerspectiveCamera } from "three";

// The frames drawn after a view is set before it is read back, for the temporal anti-aliasing's history to settle on it
const SETTLE_FRAME_COUNT = 8;
// A view of the witness render as the tools set it: a camera pose (the eye in three's axes, its heading about y and its
// Pitch about x in radians, its vertical field of view in degrees), the families of parts the witness draws in place of
// The scene's own (every family it has unless told), how it shades its exports, and whether the scene draws alone,
// Without its own fog, clouds and cloud sea
export interface WitnessView {
  camera?: { fov: number; pitch: number; position: [number, number, number]; yaw: number };
  families?: string[];
  isAlone?: boolean;
  shading?: WitnessShading;
}
// Sets the witness render's view and waits for the frames that draw it. The scene's own props never move its camera
// While its flight holds, so the pose set here stands until the next
export const setWitnessView = async (
  { families, isAlone, parts }: SceneWitness,
  { camera, families: viewFamilies, isAlone: isViewAlone = false, shading = WitnessShading.Exported }: WitnessView,
): Promise<void> => {
  isAlone.value = isViewAlone;
  families.value = viewFamilies ?? parts.children.map(({ name }) => name);
  for (const group of parts.children) group.visible = families.value.includes(group.name);
  parts.traverse((object) => {
    const shadingMaterialMap = object.userData.shadingMaterialMap as
      | Record<WitnessShading, Mesh["material"]>
      | undefined;
    if (object instanceof Mesh && shadingMaterialMap) object.material = shadingMaterialMap[shading];
  });
  const sceneCamera = parts.parent?.children.find((child) => child instanceof PerspectiveCamera);
  if (camera && sceneCamera instanceof PerspectiveCamera) {
    sceneCamera.position.set(...camera.position);
    sceneCamera.rotation.set(camera.pitch, camera.yaw, 0, "YXZ");
    sceneCamera.fov = camera.fov;
    sceneCamera.updateProjectionMatrix();
  }
  for (let frame = 0; frame < SETTLE_FRAME_COUNT; frame++)
    // oxlint-disable-next-line no-await-in-loop -- one frame is waited for after another
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => {
        resolve();
      });
    });
};
