import type { CharacterPoseInput } from "#src/models/character/CharacterPoseInput";
import type { CharacterPoseRotations } from "#src/models/character/CharacterPoseRotations";

import {
  POSE_AIR_STANCES,
  POSE_ARM_BEND_RADIANS,
  POSE_ARM_LOWER_RADIANS,
  POSE_BREATH_SECONDS,
  POSE_CHEST_BREATH_RADIANS,
  POSE_GAITS,
  POSE_SHOULDER_BREATH_RADIANS,
} from "#src/character/pose/constants";
import { MmdBoneName } from "#src/models/character/MmdBoneName";
import { Quaternion, Vector3 } from "three";

const TAU = Math.PI * 2;
const AXIS_X = new Vector3(1, 0, 0);
const AXIS_Z = new Vector3(0, 0, 1);
const armZRotation = new Quaternion();
const armXRotation = new Quaternion();
// Sets a bone's rotation as its X turn after its Z turn, so the arm is lowered from the T and then swung forward or back
const setBoneRotation = (rotation: Quaternion, xAngle: number, zAngle: number): void => {
  armZRotation.setFromAxisAngle(AXIS_Z, zAngle);
  armXRotation.setFromAxisAngle(AXIS_X, xAngle);
  rotation.multiplyQuaternions(armXRotation, armZRotation);
};
// Writes each standard bone's rotation for the body's state: the arms lowered from the T, the chest and shoulders
// Breathing in every state, and a gait's legs, knees, arms and elbows swinging opposite, with the air's fixed stances
// For the jump, the fall, the plunge and the glide. The PMX places 左 at +x, so a left arm's rest turns it down the other
// Way from a right one's. A state with no pose of its own stands idle
export const computeCharacterPose = (
  { elapsed, state, stridePhase }: CharacterPoseInput,
  rotations: CharacterPoseRotations,
): void => {
  const breath = Math.sin((elapsed * TAU) / POSE_BREATH_SECONDS);
  const gait = POSE_GAITS[state];
  const air = POSE_AIR_STANCES[state];
  const armLower = air?.armLowerRadians ?? POSE_ARM_LOWER_RADIANS;
  const lean = gait?.leanRadians ?? air?.leanRadians ?? 0;
  const armBend = gait?.armBendRadians ?? POSE_ARM_BEND_RADIANS;
  const sinPhase = Math.sin(stridePhase);
  const cosPhase = Math.cos(stridePhase);
  // The left leg swings forward as the stride's sine rises, the right leg half a stride behind it, and each arm opposite
  // Its own leg
  const legSwing = gait?.legSwingRadians ?? 0;
  const armSwing = gait?.armSwingRadians ?? 0;
  const kneeBend = gait?.kneeBendRadians ?? air?.kneeBendRadians ?? 0;
  const shoulderBreath = breath * POSE_SHOULDER_BREATH_RADIANS;

  setBoneRotation(rotations[MmdBoneName.Center], 0, 0);
  setBoneRotation(rotations[MmdBoneName.Upper], lean + breath * POSE_CHEST_BREATH_RADIANS, 0);
  setBoneRotation(rotations[MmdBoneName.Upper2], lean / 2, 0);
  setBoneRotation(rotations[MmdBoneName.Lower], 0, 0);
  setBoneRotation(rotations[MmdBoneName.Neck], 0, 0);
  setBoneRotation(rotations[MmdBoneName.Head], 0, 0);
  setBoneRotation(rotations[MmdBoneName.LeftShoulder], 0, shoulderBreath);
  setBoneRotation(rotations[MmdBoneName.RightShoulder], 0, -shoulderBreath);
  setBoneRotation(rotations[MmdBoneName.LeftArm], armSwing * sinPhase, -armLower);
  setBoneRotation(rotations[MmdBoneName.RightArm], -armSwing * sinPhase, armLower);
  setBoneRotation(rotations[MmdBoneName.LeftElbow], -armBend, 0);
  setBoneRotation(rotations[MmdBoneName.RightElbow], -armBend, 0);
  setBoneRotation(rotations[MmdBoneName.LeftWrist], 0, 0);
  setBoneRotation(rotations[MmdBoneName.RightWrist], 0, 0);
  setBoneRotation(rotations[MmdBoneName.LeftLeg], -legSwing * sinPhase, 0);
  setBoneRotation(rotations[MmdBoneName.RightLeg], legSwing * sinPhase, 0);
  // A gait's knee bends most as its leg passes under the body, so each knee bends on the half of the stride its leg
  // Moves forward, and an air stance bends both knees alike
  const leftKnee = gait ? kneeBend * Math.max(0, cosPhase) : kneeBend;
  const rightKnee = gait ? kneeBend * Math.max(0, -cosPhase) : kneeBend;
  setBoneRotation(rotations[MmdBoneName.LeftKnee], leftKnee, 0);
  setBoneRotation(rotations[MmdBoneName.RightKnee], rightKnee, 0);
  setBoneRotation(rotations[MmdBoneName.LeftAnkle], 0, 0);
  setBoneRotation(rotations[MmdBoneName.RightAnkle], 0, 0);
};
