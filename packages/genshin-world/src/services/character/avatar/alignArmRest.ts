import type { Bone, Vector3Tuple } from "three";

import { Quaternion, Vector3 } from "three";

// Turns an upper arm about its shoulder, with its chain, until its elbow lies along the direction the pack's arm rests in.
// The turn is taken in the bone's rest, after the mesh is bound at the rest it was modelled in, so the skin still draws the
// Model where it is and only the rest the poser writes on moves
export const alignArmRest = (upperArm: Bone, lowerArm: Bone, direction: Vector3Tuple): void => {
  upperArm.updateWorldMatrix(true, false);
  const restElbow = lowerArm.getWorldPosition(new Vector3()).sub(upperArm.getWorldPosition(new Vector3())).normalize();
  const turn = new Quaternion().setFromUnitVectors(restElbow, new Vector3(...direction).normalize());
  const worldRotation = turn.multiply(upperArm.getWorldQuaternion(new Quaternion()));
  const parentRotation = upperArm.parent?.getWorldQuaternion(new Quaternion()) ?? new Quaternion();
  upperArm.quaternion.copy(parentRotation.invert().multiply(worldRotation));
  upperArm.updateMatrixWorld(true);
};
