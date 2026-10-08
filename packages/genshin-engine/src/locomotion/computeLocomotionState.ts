import type { Locomotion } from "#src/models/locomotion/Locomotion";
import type { LocomotionContact } from "#src/models/locomotion/LocomotionContact";
import type { LocomotionInput } from "#src/models/locomotion/LocomotionInput";
import type { LocomotionPhase } from "#src/models/locomotion/LocomotionPhase";

import {
  AIR_LOCOMOTION_STATES,
  CLIMB_LOCOMOTION_STATES,
  CLIMB_REGRAB_SECONDS,
  CLIMB_START_STAMINA,
  GROUND_LOCOMOTION_STATES,
} from "#src/locomotion/constants";
import { InputAction } from "#src/models/input/InputAction";
import { LocomotionState } from "#src/models/locomotion/LocomotionState";

const checkIsMoving = ({ moveForward, moveRight }: LocomotionInput): boolean => moveForward !== 0 || moveRight !== 0;
const checkIsClimbable = (contact: LocomotionContact, stamina: number): boolean =>
  contact.isFacingWall && stamina >= CLIMB_START_STAMINA;
// Standing, walking or running, as the move asks
const getFootState = (input: LocomotionInput): LocomotionState => {
  if (!checkIsMoving(input)) return LocomotionState.Idle;
  else if (input.isWalking) return LocomotionState.Walk;
  else return LocomotionState.Run;
};
// Where the body goes once its wall or its water is gone: onto its feet on walkable ground, else falling
const getUnheldState = (input: LocomotionInput, contact: LocomotionContact): LocomotionState =>
  contact.isGrounded ? getFootState(input) : LocomotionState.Fall;
const getNextGroundState = (
  { state, stateSeconds }: LocomotionPhase,
  input: LocomotionInput,
  contact: LocomotionContact,
  stamina: number,
  locomotion: Locomotion,
): LocomotionState => {
  const isMoving = checkIsMoving(input);
  if (contact.isInDeepWater) return LocomotionState.Swim;
  else if (!contact.isGrounded) return LocomotionState.Fall;
  else if (input.pressedActions.has(InputAction.Jump)) return LocomotionState.Jump;
  else if (isMoving && checkIsClimbable(contact, stamina)) return LocomotionState.Climb;
  else if (state === LocomotionState.Dash && stateSeconds < locomotion.dashSeconds) return LocomotionState.Dash;
  else if (input.pressedActions.has(InputAction.Sprint) && stamina > 0) return LocomotionState.Dash;
  else if (
    [LocomotionState.Dash, LocomotionState.Sprint].includes(state) &&
    isMoving &&
    input.isSprintHeld &&
    stamina > 0
  )
    return LocomotionState.Sprint;
  else return getFootState(input);
};
const getNextAirState = (
  { state, stateSeconds }: LocomotionPhase,
  input: LocomotionInput,
  contact: LocomotionContact,
  stamina: number,
): LocomotionState => {
  if (contact.isInDeepWater) return LocomotionState.Swim;
  else if (contact.isGrounded && !contact.isRising) return getFootState(input);
  else if (
    checkIsMoving(input) &&
    checkIsClimbable(contact, stamina) &&
    (state === LocomotionState.Jump || stateSeconds >= CLIMB_REGRAB_SECONDS)
  )
    return LocomotionState.Climb;
  else if (input.pressedActions.has(InputAction.Jump) && contact.isHighAboveGround && stamina > 0)
    return LocomotionState.Glide;
  else if (input.pressedActions.has(InputAction.NormalAttack) && contact.isHighAboveGround)
    return LocomotionState.Plunge;
  else return contact.isRising ? LocomotionState.Jump : LocomotionState.Fall;
};
const getNextGlideState = (input: LocomotionInput, contact: LocomotionContact, stamina: number): LocomotionState => {
  if (contact.isInDeepWater) return LocomotionState.Swim;
  else if (contact.isGrounded) return getFootState(input);
  else if (checkIsClimbable(contact, stamina)) return LocomotionState.Climb;
  else if (input.pressedActions.has(InputAction.NormalAttack)) return LocomotionState.Plunge;
  else if (input.pressedActions.has(InputAction.Jump) || stamina <= 0) return LocomotionState.Fall;
  else return LocomotionState.Glide;
};
const getNextClimbState = (
  { state, stateSeconds }: LocomotionPhase,
  input: LocomotionInput,
  contact: LocomotionContact,
  stamina: number,
  locomotion: Locomotion,
): LocomotionState => {
  if (input.pressedActions.has(InputAction.Drop) || stamina <= 0) return LocomotionState.Fall;
  else if (state === LocomotionState.ClimbJump && stateSeconds < locomotion.climbJumpSeconds)
    return LocomotionState.ClimbJump;
  else if (!contact.isFacingWall || (contact.isGrounded && input.moveForward < 0))
    return getUnheldState(input, contact);
  else if (input.pressedActions.has(InputAction.Jump)) return LocomotionState.ClimbJump;
  else return LocomotionState.Climb;
};
const getNextWaterState = (
  { state }: LocomotionPhase,
  input: LocomotionInput,
  contact: LocomotionContact,
  stamina: number,
): LocomotionState => {
  if (!contact.isInDeepWater) return getUnheldState(input, contact);
  else if (stamina <= 0) return LocomotionState.Drown;
  else if (
    checkIsMoving(input) &&
    (input.pressedActions.has(InputAction.Sprint) || (state === LocomotionState.SwimDash && input.isSprintHeld))
  )
    return LocomotionState.SwimDash;
  else return LocomotionState.Swim;
};
// The body's next state from its phase, the step's input, what the world says of it and the stamina left, by the game's
// Gates: deep water swims, a wall pushed into is climbed with stamina enough to start, a jump high enough opens the
// Glider and an attack there plunges, and an action whose stamina runs out stops, a sprint dropping to a run, a climb
// Letting go, a glide closing and a swim drowning. A dash, a climb's jump and drowning last their seconds, and a fall
// Catches a wall only once it has fallen a moment
export const computeLocomotionState = (
  phase: LocomotionPhase,
  input: LocomotionInput,
  contact: LocomotionContact,
  stamina: number,
  locomotion: Locomotion,
): LocomotionState => {
  const { state, stateSeconds } = phase;
  if (GROUND_LOCOMOTION_STATES.includes(state)) return getNextGroundState(phase, input, contact, stamina, locomotion);
  else if (AIR_LOCOMOTION_STATES.includes(state)) return getNextAirState(phase, input, contact, stamina);
  else if (state === LocomotionState.Glide) return getNextGlideState(input, contact, stamina);
  else if (state === LocomotionState.Plunge && contact.isInDeepWater) return LocomotionState.Swim;
  else if (state === LocomotionState.Plunge) return contact.isGrounded ? LocomotionState.Idle : LocomotionState.Plunge;
  else if (CLIMB_LOCOMOTION_STATES.includes(state))
    return getNextClimbState(phase, input, contact, stamina, locomotion);
  else if (state === LocomotionState.Drown)
    return stateSeconds < locomotion.drownSeconds ? LocomotionState.Drown : LocomotionState.Idle;
  else return getNextWaterState(phase, input, contact, stamina);
};
