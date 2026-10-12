import type { CharacterPoseRotations } from "#src/models/character/CharacterPoseRotations";

import { computeCharacterPose } from "#src/character/pose/computeCharacterPose";
import { POSE_ARM_LOWER_RADIANS, POSE_GAITS } from "#src/character/pose/constants";
import { createCharacterPoseRotations } from "#src/character/pose/createCharacterPoseRotations";
import { MmdBoneName } from "#src/models/character/MmdBoneName";
import { LocomotionState } from "#src/models/locomotion/LocomotionState";
import { Quaternion, Vector3 } from "three";
import { describe, expect, test } from "vitest";

const AXIS_X = new Vector3(1, 0, 0);
const AXIS_Z = new Vector3(0, 0, 1);
const turnAbout = (axis: Vector3, angle: number): Quaternion => new Quaternion().setFromAxisAngle(axis, angle);
// A bone's rotation as its X turn after its Z turn, the order the pose composes them in
const turnAfter = (xAngle: number, zAngle: number): Quaternion =>
  new Quaternion().multiplyQuaternions(turnAbout(AXIS_X, xAngle), turnAbout(AXIS_Z, zAngle));
// Quaternions compare component by component, since a turn by zero leaves a signed zero that a strict comparison splits
const expectRotation = (rotation: Quaternion, expected: Quaternion): void => {
  const expectedComponents = expected.toArray();
  for (const [index, component] of rotation.toArray().entries())
    expect(component).toBeCloseTo(expectedComponents[index] ?? Number.NaN);
};
const posedRotations = (state: LocomotionState, stridePhase: number): CharacterPoseRotations => {
  const rotations = createCharacterPoseRotations();
  computeCharacterPose({ elapsed: 0, state, stridePhase }, rotations);
  return rotations;
};

describe(computeCharacterPose, () => {
  test("lowers the arms from the T to the relaxed stance, the left one down and the right one down the other way", () => {
    expect.hasAssertions();

    const rotations = posedRotations(LocomotionState.Idle, 0);

    expectRotation(rotations[MmdBoneName.LeftArm], turnAfter(0, -POSE_ARM_LOWER_RADIANS));
    expectRotation(rotations[MmdBoneName.RightArm], turnAfter(0, POSE_ARM_LOWER_RADIANS));
  });

  test("swings each leg against the arm on its own side, and bends a knee as its leg passes under the body", () => {
    expect.hasAssertions();

    const { armSwingRadians, kneeBendRadians, legSwingRadians } = POSE_GAITS[LocomotionState.Walk]!;
    const forward = posedRotations(LocomotionState.Walk, Math.PI / 2);
    const passing = posedRotations(LocomotionState.Walk, 0);

    expectRotation(forward[MmdBoneName.LeftLeg], turnAfter(-legSwingRadians, 0));
    expectRotation(forward[MmdBoneName.RightLeg], turnAfter(legSwingRadians, 0));
    expectRotation(forward[MmdBoneName.LeftArm], turnAfter(armSwingRadians, -POSE_ARM_LOWER_RADIANS));
    expectRotation(forward[MmdBoneName.RightArm], turnAfter(-armSwingRadians, POSE_ARM_LOWER_RADIANS));
    expectRotation(passing[MmdBoneName.LeftKnee], turnAfter(kneeBendRadians, 0));
    expectRotation(passing[MmdBoneName.RightKnee], turnAfter(0, 0));
  });

  test("gives the glide its own stance, its arms spread wide and its body leaning into the glider", () => {
    expect.hasAssertions();

    const rotations = posedRotations(LocomotionState.Glide, 0);

    expectRotation(rotations[MmdBoneName.LeftArm], turnAfter(0, -0.3));
    expectRotation(rotations[MmdBoneName.Upper], turnAfter(0.3, 0));
  });
});
