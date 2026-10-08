import type { CharacterController } from "#src/models/locomotion/CharacterController";
import type { CharacterControllerOptions } from "#src/models/locomotion/CharacterControllerOptions";
import type { Locomotion } from "#src/models/locomotion/Locomotion";
import type { LocomotionContact } from "#src/models/locomotion/LocomotionContact";
import type { LocomotionInput } from "#src/models/locomotion/LocomotionInput";
import type { LocomotionPhase } from "#src/models/locomotion/LocomotionPhase";

import { computeLocomotionState } from "#src/locomotion/computeLocomotionState";
import {
  AIR_LOCOMOTION_STATES,
  CLIMB_LOCOMOTION_STATES,
  GROUND_CONTACT_DISTANCE,
  GROUND_LOCOMOTION_STATES,
  GROUND_PRESS_SPEED,
  STEEP_SLIDE_SPEED,
  WALK_MOVE_MAGNITUDE,
  WALL_PRESS_SPEED,
  WALL_PROBE_DISTANCE,
  WATER_LOCOMOTION_STATES,
} from "#src/locomotion/constants";
import { createStamina } from "#src/locomotion/createStamina";
import { InputAction } from "#src/models/input/InputAction";
import { LocomotionState } from "#src/models/locomotion/LocomotionState";
import { Vector3 } from "three";
import { Capsule } from "three/examples/jsm/math/Capsule.js";

// The speed a state moves the body at: on foot and in water its own, and in the air the speed it carries from the
// State it left, its walk, its sprint, its glide, or else its run
const getSpeed = (state: LocomotionState, locomotion: Locomotion): number => {
  if (state === LocomotionState.Walk) return locomotion.walkSpeed;
  else if ([LocomotionState.Dash, LocomotionState.Sprint].includes(state)) return locomotion.sprintSpeed;
  else if (state === LocomotionState.Glide) return locomotion.glideForwardSpeed;
  else if (state === LocomotionState.Swim) return locomotion.swimSpeed;
  else if (state === LocomotionState.SwimDash) return locomotion.swimDashSpeed;
  else return locomotion.runSpeed;
};
// A kinematic capsule moved by its states in fixed steps, in the frame the ground and the landmarks are read in. A step
// Reads what the world says of the body, moves to its next state, spends or refills stamina, then moves: on the ground
// It follows the terrain up and down a step and stops at a rise too steep to walk, in the air it falls under gravity,
// On a wall it moves along the wall's plane, held to the terrain's surface or pressed into a landmark's, and in water it
// Floats at its wading depth. The capsule is then pushed out of the landmarks, which stand it on a floor or hold it
// Against a wall. A drowned body comes back where its stamina was last full, refilled
export const createCharacterController = ({
  ground,
  landmarkCollider,
  position,
  staminaMaximum,
}: CharacterControllerOptions): CharacterController => {
  const previousPosition = position.clone();
  const lastFullPosition = position.clone();
  const velocity = new Vector3();
  const moveDirection = new Vector3();
  const dashDirection = new Vector3();
  const wallNormal = new Vector3();
  const wallUp = new Vector3();
  const wallRight = new Vector3();
  const capsule = new Capsule();
  const heldPresses = new Set<InputAction>();
  const phase: LocomotionPhase = { state: LocomotionState.Idle, stateSeconds: 0 };
  const stamina = createStamina(staminaMaximum);
  const contact: LocomotionContact = {
    isFacingWall: false,
    isGrounded: true,
    isHighAboveGround: false,
    isInDeepWater: false,
    isRising: false,
  };
  const locomotionInput: LocomotionInput = {
    isSprintHeld: false,
    isWalking: false,
    moveForward: 0,
    moveRight: 0,
    pressedActions: heldPresses,
  };
  let facing = 0;
  let airSpeed = 0;
  let isWalkToggled = false;
  // Whether the last step's push out of the landmarks stood the body on one, or held it against one's wall
  let isOnLandmarkFloor = false;
  let isOnLandmarkWall = false;
  // Whether ground too steep to walk rises past a step just ahead the way given, its normal then kept as the wall's
  const checkIsTerrainWallAhead = (directionX: number, directionZ: number, locomotion: Locomotion): boolean => {
    const length = Math.hypot(directionX, directionZ);
    if (length === 0) return false;
    const reach = (locomotion.capsuleRadius + WALL_PROBE_DISTANCE) / length;
    const { height, normal } = ground.getGround(position.x + directionX * reach, position.z + directionZ * reach);
    if (normal.y >= Math.cos(locomotion.maxWalkableSlope) || height <= position.y + locomotion.stepHeight) return false;
    wallNormal.copy(normal);
    return true;
  };
  const readContact = (locomotion: Locomotion, isMoving: boolean): void => {
    const { height: groundHeight, normal } = ground.getGround(position.x, position.z);
    const heightAboveGround = position.y - groundHeight;
    const isOnSteepGround = normal.y < Math.cos(locomotion.maxWalkableSlope);
    const isOnGround = heightAboveGround <= GROUND_CONTACT_DISTANCE;
    const waterLevel = ground.getWaterLevel();
    contact.isRising = velocity.y > 0;
    contact.isGrounded = isOnLandmarkFloor || (isOnGround && !isOnSteepGround);
    contact.isHighAboveGround = heightAboveGround >= locomotion.glideMinHeight;
    contact.isInDeepWater = waterLevel - groundHeight > locomotion.swimDepth && position.y < waterLevel;
    if (CLIMB_LOCOMOTION_STATES.includes(phase.state)) {
      if (!isOnLandmarkWall && isOnGround && isOnSteepGround) wallNormal.copy(normal);
      contact.isFacingWall =
        isOnLandmarkWall ||
        (isOnGround && isOnSteepGround) ||
        checkIsTerrainWallAhead(-wallNormal.x, -wallNormal.z, locomotion);
      return;
    }
    // A glide with no move pushes the way it heads
    const pushX = isMoving || phase.state !== LocomotionState.Glide ? moveDirection.x : -Math.sin(facing);
    const pushZ = isMoving || phase.state !== LocomotionState.Glide ? moveDirection.z : -Math.cos(facing);
    contact.isFacingWall =
      (isOnLandmarkWall && pushX * wallNormal.x + pushZ * wallNormal.z < 0) ||
      checkIsTerrainWallAhead(pushX, pushZ, locomotion);
  };
  const enter = (state: LocomotionState, previousState: LocomotionState, locomotion: Locomotion): void => {
    if (previousState === LocomotionState.Drown) {
      position.copy(lastFullPosition);
      previousPosition.copy(position);
      stamina.refill();
    }
    if (AIR_LOCOMOTION_STATES.includes(state) && !AIR_LOCOMOTION_STATES.includes(previousState))
      airSpeed = getSpeed(previousState, locomotion);
    if (state === LocomotionState.Jump) velocity.y = Math.sqrt(2 * locomotion.gravity * locomotion.jumpHeight);
    else if (state === LocomotionState.Fall && CLIMB_LOCOMOTION_STATES.includes(previousState)) velocity.set(0, 0, 0);
    else if (state === LocomotionState.Dash && moveDirection.lengthSq() > 0) dashDirection.copy(moveDirection);
    else if (state === LocomotionState.Dash) dashDirection.set(-Math.sin(facing), 0, -Math.cos(facing));
  };
  const move = (locomotion: Locomotion, isMoving: boolean, stepSeconds: number): void => {
    const { state } = phase;
    if (state === LocomotionState.Dash)
      velocity.set(dashDirection.x * locomotion.dashSpeed, -GROUND_PRESS_SPEED, dashDirection.z * locomotion.dashSpeed);
    else if (GROUND_LOCOMOTION_STATES.includes(state)) {
      const speed = state === LocomotionState.Idle ? 0 : getSpeed(state, locomotion);
      velocity.set(moveDirection.x * speed, -GROUND_PRESS_SPEED, moveDirection.z * speed);
    } else if (AIR_LOCOMOTION_STATES.includes(state))
      velocity.set(
        moveDirection.x * airSpeed,
        velocity.y - locomotion.gravity * stepSeconds,
        moveDirection.z * airSpeed,
      );
    else if (state === LocomotionState.Plunge) velocity.set(0, -locomotion.plungeSpeed, 0);
    else if (state === LocomotionState.Glide) {
      const headingX = isMoving ? moveDirection.x : -Math.sin(facing);
      const headingZ = isMoving ? moveDirection.z : -Math.cos(facing);
      velocity.set(
        headingX * locomotion.glideForwardSpeed,
        -locomotion.glideSinkSpeed,
        headingZ * locomotion.glideForwardSpeed,
      );
    } else if (CLIMB_LOCOMOTION_STATES.includes(state)) {
      const isClimbJump = state === LocomotionState.ClimbJump;
      wallUp.set(-wallNormal.x * wallNormal.y, 1 - wallNormal.y ** 2, -wallNormal.z * wallNormal.y).normalize();
      wallRight.crossVectors(wallUp, wallNormal).normalize();
      velocity
        .copy(wallUp)
        .multiplyScalar(
          isClimbJump
            ? locomotion.climbJumpHeight / locomotion.climbJumpSeconds
            : locomotionInput.moveForward * locomotion.climbSpeed,
        )
        .addScaledVector(wallRight, isClimbJump ? 0 : locomotionInput.moveRight * locomotion.climbSpeed);
      if (isOnLandmarkWall) velocity.addScaledVector(wallNormal, -WALL_PRESS_SPEED);
    } else if (state === LocomotionState.Drown) velocity.set(0, 0, 0);
    else {
      const speed = getSpeed(state, locomotion);
      velocity.set(moveDirection.x * speed, 0, moveDirection.z * speed);
    }
    position.addScaledVector(velocity, stepSeconds);
  };
  const resolve = (locomotion: Locomotion, stepSeconds: number): void => {
    const cosMaxSlope = Math.cos(locomotion.maxWalkableSlope);
    const groundSample = ground.getGround(position.x, position.z);
    const slopeX = groundSample.normal.x;
    const slopeZ = groundSample.normal.z;
    const isOnSteepGround = groundSample.normal.y < cosMaxSlope;
    let groundHeight = groundSample.height;
    if (GROUND_LOCOMOTION_STATES.includes(phase.state)) {
      if (isOnSteepGround && groundHeight > previousPosition.y + locomotion.stepHeight) {
        position.x = previousPosition.x;
        position.z = previousPosition.z;
        groundHeight = ground.getGround(position.x, position.z).height;
      }
      if (position.y - groundHeight <= locomotion.stepHeight) position.y = groundHeight;
    } else if (CLIMB_LOCOMOTION_STATES.includes(phase.state)) {
      if (!isOnLandmarkWall) position.y = groundHeight;
    } else if (WATER_LOCOMOTION_STATES.includes(phase.state))
      position.y = Math.max(groundHeight, ground.getWaterLevel() - locomotion.swimDepth);
    else if (position.y < groundHeight) {
      position.y = groundHeight;
      velocity.y = Math.max(0, velocity.y);
      if (isOnSteepGround) {
        position.x += slopeX * STEEP_SLIDE_SPEED * stepSeconds;
        position.z += slopeZ * STEEP_SLIDE_SPEED * stepSeconds;
      }
    }
    const { capsuleHeight, capsuleRadius } = locomotion;
    capsule.start.set(position.x, position.y + capsuleRadius, position.z);
    capsule.end.set(position.x, position.y + capsuleHeight - capsuleRadius, position.z);
    capsule.radius = capsuleRadius;
    const capsulePush = landmarkCollider.pushCapsule(capsule);
    isOnLandmarkFloor = false;
    isOnLandmarkWall = false;
    if (!capsulePush) return;
    position.addScaledVector(capsulePush.normal, capsulePush.depth);
    if (capsulePush.normal.y >= cosMaxSlope) {
      isOnLandmarkFloor = true;
      velocity.y = Math.max(0, velocity.y);
    } else if (capsulePush.normal.y > -cosMaxSlope) {
      isOnLandmarkWall = true;
      wallNormal.copy(capsulePush.normal);
    } else velocity.y = Math.min(0, velocity.y);
  };
  const turn = (isMoving: boolean): void => {
    if (CLIMB_LOCOMOTION_STATES.includes(phase.state)) facing = Math.atan2(wallNormal.x, wallNormal.z);
    else if (phase.state === LocomotionState.Dash) facing = Math.atan2(-dashDirection.x, -dashDirection.z);
    else if (isMoving && ![LocomotionState.Drown, LocomotionState.Plunge].includes(phase.state))
      facing = Math.atan2(-moveDirection.x, -moveDirection.z);
  };
  return {
    face: (targetFacing) => {
      facing = targetFacing;
    },
    get facing() {
      return facing;
    },
    heldPresses,
    holdPresses: (input) => {
      for (const action of input.pressedActions) heldPresses.add(action);
    },
    phase,
    place: (placedPosition, placedFacing) => {
      position.copy(placedPosition);
      previousPosition.copy(placedPosition);
      lastFullPosition.copy(placedPosition);
      velocity.set(0, 0, 0);
      phase.state = LocomotionState.Idle;
      phase.stateSeconds = 0;
      facing = placedFacing;
    },
    position,
    previousPosition,
    stamina,
    step: (input, cameraYaw, locomotion, stepSeconds) => {
      previousPosition.copy(position);
      if (heldPresses.has(InputAction.SwitchWalkRun)) isWalkToggled = !isWalkToggled;
      const sinYaw = Math.sin(cameraYaw);
      const cosYaw = Math.cos(cameraYaw);
      moveDirection.set(
        -sinYaw * input.moveForward + cosYaw * input.moveRight,
        0,
        -cosYaw * input.moveForward - sinYaw * input.moveRight,
      );
      const moveMagnitude = Math.min(1, moveDirection.length());
      const isMoving = moveMagnitude > 0;
      if (isMoving) moveDirection.normalize();
      locomotionInput.isSprintHeld = input.heldActions.has(InputAction.Sprint);
      locomotionInput.isWalking = isWalkToggled || moveMagnitude < WALK_MOVE_MAGNITUDE;
      locomotionInput.moveForward = input.moveForward;
      locomotionInput.moveRight = input.moveRight;
      readContact(locomotion, isMoving);
      const previousState = phase.state;
      const state = computeLocomotionState(phase, locomotionInput, contact, stamina.value, locomotion);
      heldPresses.clear();
      const isEntered = state !== previousState;
      if (isEntered) enter(state, previousState, locomotion);
      phase.state = state;
      phase.stateSeconds = isEntered ? 0 : phase.stateSeconds + stepSeconds;
      stamina.step(phase, isEntered, isMoving, stepSeconds);
      move(locomotion, isMoving, stepSeconds);
      resolve(locomotion, stepSeconds);
      turn(isMoving);
      if (stamina.value >= stamina.maximum && GROUND_LOCOMOTION_STATES.includes(phase.state))
        lastFullPosition.copy(position);
    },
  };
};
