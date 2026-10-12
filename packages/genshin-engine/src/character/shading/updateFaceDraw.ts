import type { FaceDraw } from "#src/models/character/FaceDraw";
import type { Quaternion } from "three";

import { MathUtils, Vector3 } from "three";
import { uniform } from "three/tsl";

// The threshold's bounds, a face lit straight on at the first and one turned fully from the light at the last
const MINIMUM_THRESHOLD = 1e-4;
const MAXIMUM_THRESHOLD = 0.9999;
const HALF_TURN_DEGREES = 180;
const RIGHT_ANGLE_DEGREES = 90;
// The root bone's own axes in world space, reused each frame so none is allocated per frame
const rootAxisY = new Vector3();
const rootAxisZ = new Vector3();

// A face's draw with its values for the frame not yet set, the threshold at its minimum and no flip, and the two values
// The material gives beside them, which default to none
export const createFaceDraw = ({
  flipFactor = 0,
  rotateOffset = 0,
}: Partial<Pick<FaceDraw, "flipFactor" | "rotateOffset">> = {}): FaceDraw => ({
  flip: uniform(0),
  flipFactor,
  rotateOffset,
  threshold: uniform(MINIMUM_THRESHOLD),
});

// The face's angle about its root's Y axis from the light, in degrees, from the light's dot products with the root's Y
// And Z axes, a light along Y at zero and one that is level with Y and across Z at a right angle
const getFaceAngle = (dotY: number, dotZ: number): number => {
  if (dotY !== 0) return (-Math.atan2(dotZ, dotY) * HALF_TURN_DEGREES) / Math.PI;
  return dotZ < 0 ? RIGHT_ANGLE_DEGREES : -RIGHT_ANGLE_DEGREES;
};

// The threshold from how far the angle has turned, as a fraction of a half turn, ramped from the rotate offset to the
// Offset's end and eased with a smooth step, so a face turned from the light reads its face map's upper end
const getThreshold = (turn: number, rotateOffset: number): number => {
  const low = Math.max(rotateOffset, 0);
  const high = Math.min(rotateOffset + 1, 1);
  if (high <= low) return MathUtils.clamp(turn >= low ? 1 : 0, MINIMUM_THRESHOLD, MAXIMUM_THRESHOLD);
  const ramp = MathUtils.clamp((turn - low) / (high - low), 0, 1);
  return MathUtils.clamp(ramp * ramp * (3 - 2 * ramp), MINIMUM_THRESHOLD, MAXIMUM_THRESHOLD);
};

// Whether the face map's u is mirrored: where the angle turns positive, unless the material's flip factor forces it either way
const getIsFlipped = (angle: number, flipFactor: number): boolean => {
  if (flipFactor > 0.5) return true;
  if (flipFactor < -0.5) return false;
  return angle > 0;
};

// Sets a face's threshold and flip for the frame from the light and its root bone's rotation, the game's face draw
// Computed once a frame on the CPU, the light being the body's own main light
export const updateFaceDraw = (faceDraw: FaceDraw, lightDirection: Vector3, rootRotation: Quaternion): void => {
  rootAxisY.set(0, 1, 0).applyQuaternion(rootRotation);
  rootAxisZ.set(0, 0, 1).applyQuaternion(rootRotation);
  const angle = getFaceAngle(lightDirection.dot(rootAxisY), lightDirection.dot(rootAxisZ));
  faceDraw.threshold.value = getThreshold(Math.abs(angle) / HALF_TURN_DEGREES, faceDraw.rotateOffset);
  faceDraw.flip.value = getIsFlipped(angle, faceDraw.flipFactor) ? 1 : 0;
};
