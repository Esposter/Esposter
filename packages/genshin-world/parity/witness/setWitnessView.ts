import type { SceneWitness } from "#src/models/scene/SceneWitness";

import { WitnessShading } from "#parity/witness/WitnessShading";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { Mesh, PerspectiveCamera, Vector3 } from "three";

// The animation frames waited for after a view is set: the view is drawn in the frame between them, which settles it,
// Since the witness resolves edges with no temporal history and its clock is held
const SETTLE_FRAME_COUNT = 2;
// How far the drawn eye may stand from the pose set, in metres, before the view is refused
const POSE_TOLERANCE = 1e-3;
// A view of the witness render as the tools set it: a camera pose (the eye in three's axes, its heading about y and its
// Pitch about x in radians, its vertical field of view in degrees), the families of parts the witness draws in place of
// The scene's own (every family it has unless told), how it shades its exports, and whether the scene draws alone,
// Without its own fog, clouds and cloud sea; and how far each family of its parts stands off its laid-out place, in
// Metres in three's axes, for a family's place to be solved on its edges (every family at its own place unless told)
export interface WitnessView {
  camera?: { fov: number; pitch: number; position: [number, number, number]; yaw: number };
  families?: string[];
  familyOffsets?: Record<string, [number, number, number]>;
  // How many times each family's parts are scaled about their own places, each at once
  familyScales?: Record<string, number>;
  isAlone?: boolean;
  shading?: WitnessShading;
}
// Sets the witness render's view, holding the scene's clock, and waits for the frame that draws it. The scene's own bindings move its camera on any
// Frame its stage animates (the flight, the door's rush), so a pose set here freezes the camera's matrix, which those
// Bindings then cannot reach, and is read back off the drawn matrix once the frames settle: a pose that did not hold
// Throws rather than scoring the scene's own view
export const setWitnessView = async (
  { families, isAlone, isClockHeld, parts }: SceneWitness,
  {
    camera,
    families: viewFamilies,
    familyOffsets = {},
    familyScales = {},
    isAlone: isViewAlone = false,
    shading = WitnessShading.Exported,
  }: WitnessView,
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
