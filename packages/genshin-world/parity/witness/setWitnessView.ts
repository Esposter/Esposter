import type { WitnessView } from "#parity/witness/WitnessView";
import type { SceneWitness } from "#src/models/scene/SceneWitness";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { PerspectiveCamera, Vector3 } from "three";

// The animation frames waited for after a view is set: the view is drawn in the frame between them, which settles it,
// Since the witness resolves edges with no temporal history and its clock is held
const SETTLE_FRAME_COUNT = 2;
// How far the drawn eye may stand from the pose set, in metres, before the view is refused
const POSE_TOLERANCE = 1e-3;
// Sets the witness render's view, holding the scene's clock, and waits for the frame that draws it. The scene's own
// Bindings move its camera on any frame its stage animates (the flight, the door's rush), so a pose set here freezes
// The camera's matrix, which those bindings then cannot reach, and is read back off the drawn matrix once the frames
// Settle: a pose that did not hold throws rather than scoring the scene's own view
export const setWitnessView = async (
  { families, isAlone, isClockHeld, parts }: SceneWitness,
  { camera, families: viewFamilies, familyOffsets = {}, familyScales = {}, isAlone: isViewAlone = false }: WitnessView,
): Promise<void> => {
  isClockHeld.value = true;
  isAlone.value = isViewAlone;
  families.value = viewFamilies ?? parts.children.map(({ name }) => name);
  for (const group of parts.children) {
    group.visible = families.value.includes(group.name);
    // Kept for the scene, which stands a row it scrolls where its own stands, off by this
    group.userData.offset = familyOffsets[group.name] ?? [0, 0, 0];
    group.position.set(...(group.userData.offset as [number, number, number]));
    for (const part of group.children) {
      part.userData.laidScale ??= part.scale.clone();
      part.scale.copy(part.userData.laidScale).multiplyScalar(familyScales[group.name] ?? 1);
    }
  }
  const sceneCamera = parts.parent?.children.find((child) => child instanceof PerspectiveCamera);
  if (camera && sceneCamera instanceof PerspectiveCamera) {
    sceneCamera.position.set(...camera.position);
    sceneCamera.rotation.set(camera.pitch, camera.yaw, 0, "YXZ");
    sceneCamera.fov = camera.fov;
    sceneCamera.updateProjectionMatrix();
    sceneCamera.updateMatrix();
    sceneCamera.matrixAutoUpdate = false;
  }
  for (let frame = 0; frame < SETTLE_FRAME_COUNT; frame++)
    // oxlint-disable-next-line no-await-in-loop -- one frame is waited for after another
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => {
        resolve();
      });
    });
  if (!camera || !(sceneCamera instanceof PerspectiveCamera)) return;
  const drawnEye = new Vector3().setFromMatrixPosition(sceneCamera.matrixWorld);
  if (drawnEye.distanceTo(new Vector3(...camera.position)) > POSE_TOLERANCE || sceneCamera.fov !== camera.fov)
    throw new InvalidOperationError(Operation.Read, "witness view", "the scene moved its camera off the pose set");
};
