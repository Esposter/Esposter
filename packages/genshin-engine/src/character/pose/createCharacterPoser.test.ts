import type { Locomotion } from "#src/models/locomotion/Locomotion";

import { createCharacterPoser } from "#src/character/pose/createCharacterPoser";
import { MmdBoneName } from "#src/models/character/MmdBoneName";
import { LocomotionState } from "#src/models/locomotion/LocomotionState";
import { Bone, Quaternion, Skeleton, SkinnedMesh, Vector3 } from "three";
import { describe, expect, test } from "vitest";

// A chain of two bones, the upper's rest and the head's rest given by the caller, the head held on the upper
const createChain = (upperRest: Quaternion, headRest: Quaternion, names: [string, string]): SkinnedMesh => {
  const [upperName, headName] = names;
  const upper = new Bone();
  upper.name = upperName;
  upper.quaternion.copy(upperRest);
  const head = new Bone();
  head.name = headName;
  head.position.set(0, 1, 0);
  head.quaternion.copy(headRest);
  upper.add(head);
  const mesh = new SkinnedMesh();
  mesh.add(upper);
  mesh.bind(new Skeleton([upper, head]));
  return mesh;
};
// Quaternions compare component by component, since a pose's slerp leaves rounding a strict comparison splits
const expectRotation = (rotation: Quaternion, expected: Quaternion): void => {
  const expectedComponents = expected.toArray();
  for (const [index, component] of rotation.toArray().entries())
    expect(component).toBeCloseTo(expectedComponents[index] ?? Number.NaN);
};
const getWorldRotation = (mesh: SkinnedMesh, name: string): Quaternion =>
  mesh.skeleton.getBoneByName(name)?.getWorldQuaternion(new Quaternion()) ?? new Quaternion();

describe(createCharacterPoser, () => {
  const LOCOMOTION: Locomotion = {
    capsuleHeight: 2,
    capsuleRadius: 0.5,
    climbJumpHeight: 1,
    climbJumpSeconds: 1,
    climbSpeed: 1,
    dashSeconds: 1,
    dashSpeed: 1,
    drownSeconds: 1,
    glideForwardSpeed: 1,
    glideMinHeight: 1,
    glideSinkSpeed: 1,
    gravity: 10,
    jumpHeight: 1,
    maxFallSpeed: 5,
    maxWalkableSlope: 1,
    plungeSpeed: 1,
    runSpeed: 6,
    sprintSpeed: 1,
    stepHeight: 0.5,
    swimDashSpeed: 1,
    swimDepth: 1,
    swimSpeed: 1,
    walkSpeed: 1,
  };

  test("poses a bone in its rest frame, so a rotated rest holds the same pose as an identity one", () => {
    expect.hasAssertions();

    const upperRest = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), 0.7);
    const headRest = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), 0.4);
    const identity = createChain(new Quaternion(), new Quaternion(), [MmdBoneName.Upper, MmdBoneName.Head]);
    const rotated = createChain(upperRest, headRest, [MmdBoneName.Upper, MmdBoneName.Head]);
    const update = { delta: 1, locomotion: LOCOMOTION, phase: { state: LocomotionState.Idle, stateSeconds: 1 } };
    createCharacterPoser(identity).update(update);
    createCharacterPoser(rotated).update(update);

    expectRotation(
      getWorldRotation(rotated, MmdBoneName.Head),
      getWorldRotation(identity, MmdBoneName.Head).multiply(upperRest.clone().multiply(headRest)),
    );
  });

  test("poses only the bones its name map names, under the model's own names", () => {
    expect.hasAssertions();

    const mesh = createChain(new Quaternion(), new Quaternion(), ["Spine", "Head"]);
    const update = { delta: 1, locomotion: LOCOMOTION, phase: { state: LocomotionState.Idle, stateSeconds: 1 } };
    createCharacterPoser(mesh, { [MmdBoneName.Upper]: "Spine" }).update(update);

    expect(getWorldRotation(mesh, "Spine").angleTo(new Quaternion())).toBeGreaterThan(0);
    expect(mesh.skeleton.getBoneByName("Head")?.quaternion.toArray()).toStrictEqual(new Quaternion().toArray());
  });
});
