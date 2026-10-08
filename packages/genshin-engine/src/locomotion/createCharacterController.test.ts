import type { InputState } from "#src/models/input/InputState";
import type { Locomotion } from "#src/models/locomotion/Locomotion";

import { createGroundQuery } from "#src/collision/createGroundQuery";
import { createLandmarkCollider } from "#src/collision/createLandmarkCollider";
import { createCharacterController } from "#src/locomotion/createCharacterController";
import { InputAction } from "#src/models/input/InputAction";
import { LocomotionState } from "#src/models/locomotion/LocomotionState";
import { Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createCharacterController, () => {
  const STEP_SECONDS = 1 / 60;
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
  const STILL_INPUT: InputState = {
    heldActions: new Set(),
    lookPitch: 0,
    lookYaw: 0,
    moveForward: 0,
    moveRight: 0,
    moveUp: 0,
    pressedActions: new Set(),
    zoomSteps: 0,
  };
  const FORWARD_INPUT: InputState = { ...STILL_INPUT, moveForward: 1 };
  const DRY_LEVEL = -10;

  test("runs over the ground along the camera's view at its run speed", () => {
    expect.hasAssertions();

    const characterController = createCharacterController({
      ground: createGroundQuery(() => 0, DRY_LEVEL),
      landmarkCollider: createLandmarkCollider(),
      position: new Vector3(),
    });
    characterController.step(FORWARD_INPUT, Math.PI / 2, LOCOMOTION, 1);

    expect(characterController.phase.state).toBe(LocomotionState.Run);
    expect(characterController.position.x).toBeCloseTo(-LOCOMOTION.runSpeed, 9);
    expect(characterController.position.y).toBe(0);
    expect(characterController.position.z).toBeCloseTo(0, 9);
  });

  test("jumps to its height and lands again", () => {
    expect.hasAssertions();

    const characterController = createCharacterController({
      ground: createGroundQuery(() => 0, DRY_LEVEL),
      landmarkCollider: createLandmarkCollider(),
      position: new Vector3(),
    });
    characterController.holdPresses({ ...STILL_INPUT, pressedActions: new Set([InputAction.Jump]) });
    let apex = 0;
    for (let stepIndex = 0; stepIndex < 120; stepIndex++) {
      characterController.step(STILL_INPUT, 0, LOCOMOTION, STEP_SECONDS);
      apex = Math.max(apex, characterController.position.y);
    }

    expect(apex).toBeCloseTo(LOCOMOTION.jumpHeight, 1);
    expect(characterController.phase.state).toBe(LocomotionState.Idle);
  });

  test("floats in deep water at its wading depth", () => {
    expect.hasAssertions();

    const WATER_LEVEL = 5;
    const characterController = createCharacterController({
      ground: createGroundQuery(() => 0, WATER_LEVEL),
      landmarkCollider: createLandmarkCollider(),
      position: new Vector3(),
    });
    characterController.step(STILL_INPUT, 0, LOCOMOTION, STEP_SECONDS);

    expect(characterController.phase.state).toBe(LocomotionState.Swim);
    expect(characterController.position.y).toBe(WATER_LEVEL - LOCOMOTION.swimDepth);
  });

  test("comes back where it was placed when it drowns before standing anywhere", () => {
    expect.hasAssertions();

    const characterController = createCharacterController({
      ground: createGroundQuery((x) => (x > 50 ? -5 : 0), 0),
      landmarkCollider: createLandmarkCollider(),
      position: new Vector3(),
    });
    const placedPosition = new Vector3(100, -LOCOMOTION.swimDepth, 0);
    characterController.place(placedPosition, 0);
    let isDrowned = false;
    for (let stepIndex = 0; stepIndex < 60 * 600 && !isDrowned; stepIndex++) {
      characterController.step(STILL_INPUT, 0, LOCOMOTION, STEP_SECONDS);
      isDrowned = characterController.phase.state === LocomotionState.Drown;
    }
    while (characterController.phase.state === LocomotionState.Drown)
      characterController.step(STILL_INPUT, 0, LOCOMOTION, STEP_SECONDS);

    expect(isDrowned).toBe(true);
    expect(characterController.position.x).toBe(placedPosition.x);
  });
});
