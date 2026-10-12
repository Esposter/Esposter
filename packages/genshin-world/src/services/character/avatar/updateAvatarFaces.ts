import type { CharacterAvatar } from "#src/models/avatar/CharacterAvatar";
import type { Vector3 } from "three";

import { updateFaceDraw } from "genshin-engine";
import { Quaternion } from "three";

// A face's root bone's world rotation, reused each frame so none is allocated per frame
const rootRotation = new Quaternion();

// Each face of the model drawn with the frame's light, set from the body's own main light, once a frame on the CPU
export const updateAvatarFaces = ({ faces }: CharacterAvatar, lightDirection: Vector3): void => {
  for (const { draw, root } of faces) updateFaceDraw(draw, lightDirection, root.getWorldQuaternion(rootRotation));
};
