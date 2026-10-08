import type { Locomotion } from "#src/models/locomotion/Locomotion";
import type { LocomotionContact } from "#src/models/locomotion/LocomotionContact";
import type { LocomotionInput } from "#src/models/locomotion/LocomotionInput";

import { computeLocomotionState } from "#src/locomotion/computeLocomotionState";
import { CLIMB_REGRAB_SECONDS, CLIMB_START_STAMINA } from "#src/locomotion/constants";
import { InputAction } from "#src/models/input/InputAction";
import { LocomotionState } from "#src/models/locomotion/LocomotionState";
import { describe, expect, test } from "vitest";

describe(computeLocomotionState, () => {
  const STAMINA = 100;
  const LOCOMOTION: Locomotion = {
    capsuleHeight: 2,
    capsuleRadius: 1,
    climbJumpHeight: 1,
    climbJumpSeconds: 1,
    climbSpeed: 1,
    dashSeconds: 1,
    dashSpeed: 1,
    drownSeconds: 1,
    glideForwardSpeed: 1,
    glideMinHeight: 1,
    glideSinkSpeed: 1,
    gravity: 1,
    jumpHeight: 1,
    maxWalkableSlope: 1,
    plungeSpeed: 1,
    runSpeed: 1,
    sprintSpeed: 1,
    stepHeight: 1,
    swimDashSpeed: 1,
    swimDepth: 1,
    swimSpeed: 1,
    walkSpeed: 1,
  };
  const STILL: LocomotionInput = {
    isSprintHeld: false,
    isWalking: false,
    moveForward: 0,
    moveRight: 0,
    pressedActions: new Set(),
  };
  const FORWARD: LocomotionInput = { ...STILL, moveForward: 1 };
  const SPRINTING: LocomotionInput = { ...FORWARD, isSprintHeld: true };
  const GROUNDED: LocomotionContact = {
    isFacingWall: false,
    isGrounded: true,
    isHighAboveGround: false,
    isInDeepWater: false,
    isRising: false,
  };
  const AIRBORNE: LocomotionContact = { ...GROUNDED, isGrounded: false };
  const HIGH: LocomotionContact = { ...AIRBORNE, isHighAboveGround: true };
  const AT_WALL: LocomotionContact = { ...GROUNDED, isFacingWall: true };
  const AIRBORNE_AT_WALL: LocomotionContact = { ...AT_WALL, isGrounded: false };
  const IN_WATER: LocomotionContact = { ...AIRBORNE, isInDeepWater: true };
  const JUMP: LocomotionInput = { ...FORWARD, pressedActions: new Set([InputAction.Jump]) };
  const SPRINT: LocomotionInput = { ...FORWARD, pressedActions: new Set([InputAction.Sprint]) };

  test.each([
    ["jumps off the ground on a press", LocomotionState.Idle, 0, JUMP, GROUNDED, STAMINA, LocomotionState.Jump],
    [
      "walks when walking is chosen",
      LocomotionState.Run,
      0,
      { ...FORWARD, isWalking: true },
      GROUNDED,
      STAMINA,
      LocomotionState.Walk,
    ],
    ["falls once the ground drops away", LocomotionState.Run, 0, FORWARD, AIRBORNE, STAMINA, LocomotionState.Fall],
    ["swims in deep water", LocomotionState.Run, 0, FORWARD, IN_WATER, STAMINA, LocomotionState.Swim],
    ["dashes on a sprint's press", LocomotionState.Run, 0, SPRINT, GROUNDED, STAMINA, LocomotionState.Dash],
    ["holds a dash its seconds", LocomotionState.Dash, 0, FORWARD, GROUNDED, STAMINA, LocomotionState.Dash],
    [
      "sprints on from a dash while sprint is held",
      LocomotionState.Dash,
      1,
      SPRINTING,
      GROUNDED,
      STAMINA,
      LocomotionState.Sprint,
    ],
    ["drops a sprint to a run with no stamina", LocomotionState.Sprint, 0, SPRINTING, GROUNDED, 0, LocomotionState.Run],
    ["climbs a wall pushed into", LocomotionState.Run, 0, FORWARD, AT_WALL, CLIMB_START_STAMINA, LocomotionState.Climb],
    ["runs at a wall with too little stamina", LocomotionState.Run, 0, FORWARD, AT_WALL, 0, LocomotionState.Run],
    ["opens the glider high enough", LocomotionState.Fall, 0, JUMP, HIGH, STAMINA, LocomotionState.Glide],
    ["keeps falling too low to glide", LocomotionState.Fall, 0, JUMP, AIRBORNE, STAMINA, LocomotionState.Fall],
    [
      "plunges from the glider on an attack",
      LocomotionState.Glide,
      0,
      { ...FORWARD, pressedActions: new Set([InputAction.NormalAttack]) },
      HIGH,
      STAMINA,
      LocomotionState.Plunge,
    ],
    ["closes the glider with no stamina", LocomotionState.Glide, 0, FORWARD, HIGH, 0, LocomotionState.Fall],
    ["catches a wall from a jump", LocomotionState.Jump, 0, FORWARD, AIRBORNE_AT_WALL, STAMINA, LocomotionState.Climb],
    [
      "passes a wall in a fall's first moment",
      LocomotionState.Fall,
      CLIMB_REGRAB_SECONDS / 2,
      FORWARD,
      AIRBORNE_AT_WALL,
      STAMINA,
      LocomotionState.Fall,
    ],
    ["lands on walkable ground", LocomotionState.Fall, 0, STILL, GROUNDED, STAMINA, LocomotionState.Idle],
    ["jumps up a wall", LocomotionState.Climb, 0, JUMP, AT_WALL, STAMINA, LocomotionState.ClimbJump],
    [
      "lets go of a wall on a drop",
      LocomotionState.Climb,
      0,
      { ...STILL, pressedActions: new Set([InputAction.Drop]) },
      AT_WALL,
      STAMINA,
      LocomotionState.Fall,
    ],
    ["lets go of a wall with no stamina", LocomotionState.Climb, 0, FORWARD, AT_WALL, 0, LocomotionState.Fall],
    ["stands over a wall's top", LocomotionState.Climb, 0, FORWARD, GROUNDED, STAMINA, LocomotionState.Run],
    [
      "dashes in water on a sprint's press",
      LocomotionState.Swim,
      0,
      SPRINT,
      IN_WATER,
      STAMINA,
      LocomotionState.SwimDash,
    ],
    ["drowns with no stamina in deep water", LocomotionState.Swim, 0, FORWARD, IN_WATER, 0, LocomotionState.Drown],
    ["stands up once drowned its seconds", LocomotionState.Drown, 1, STILL, IN_WATER, 0, LocomotionState.Idle],
  ] as const)("%s", (_title, state, stateSeconds, input, contact, stamina, expectedState) => {
    expect.hasAssertions();

    expect(computeLocomotionState({ state, stateSeconds }, input, contact, stamina, LOCOMOTION)).toBe(expectedState);
  });
});
