import type { PlayerActions } from "@/models/agentConsole/world/PlayerActions";
import type { PlayerState } from "@/models/agentConsole/world/PlayerState";
import type { VoxelWorld } from "@/models/agentConsole/world/VoxelWorld";

import {
  AIR_ACCELERATION,
  AIR_FRICTION,
  GRAVITY,
  GROUND_ACCELERATION,
  GROUND_FRICTION,
  JUMP_VELOCITY,
  PLAYER_HEIGHT,
  PLAYER_SNEAKING_HEIGHT,
  SNEAK_MULTIPLIER,
  SPRINT_JUMP_BOOST,
  SPRINT_MULTIPLIER,
  STEPS_PER_TICK,
  VERTICAL_DRAG,
} from "@/services/agentConsole/world/constants";
import { moveThroughGrid } from "@/services/agentConsole/world/moveThroughGrid";
import { Vector3 } from "three";

const step = new Vector3();
// One step of Minecraft's movement, a share of one of its ticks. The velocity changes only between ticks, as
// Minecraft's does: a tick's first step adds the walk's acceleration and a jump from the ground, every step moves the
// Box through the grid by its share of the tick's velocity, and the last step stops the velocity along any axis it was
// Blocked on, lands the player if it was blocked falling, and applies the friction, gravity and drag. Eased a share at
// A time instead, the jump peaks under a voxel, since Minecraft moves by the whole velocity before gravity takes from it
export const simulatePlayer = (
  voxelWorld: VoxelWorld,
  playerState: PlayerState,
  actions: PlayerActions,
  wishX: number,
  wishZ: number,
) => {
  const { isOnGround, position, previousPosition, velocity } = playerState;
  if (playerState.tickStep === 0) {
    const speedMultiplier = actions.isSneaking ? SNEAK_MULTIPLIER : actions.isSprinting ? SPRINT_MULTIPLIER : 1;
    const acceleration = (isOnGround ? GROUND_ACCELERATION : AIR_ACCELERATION) * speedMultiplier;
    velocity.x += wishX * acceleration;
    velocity.z += wishZ * acceleration;
    if (actions.isJumping && isOnGround) {
      velocity.y = JUMP_VELOCITY;
      if (actions.isSprinting) {
        velocity.x += Math.sin(playerState.heading) * SPRINT_JUMP_BOOST;
        velocity.z += Math.cos(playerState.heading) * SPRINT_JUMP_BOOST;
      }
    }
  }
  previousPosition.copy(position);
  step.copy(velocity).divideScalar(STEPS_PER_TICK);
  moveThroughGrid(
    voxelWorld,
    position,
    step,
    actions.isSneaking ? PLAYER_SNEAKING_HEIGHT : PLAYER_HEIGHT,
    actions.isSneaking && isOnGround,
  );
  if (isOnGround) playerState.walkedDistance += Math.hypot(step.x, step.z);
  playerState.tickStep = (playerState.tickStep + 1) % STEPS_PER_TICK;
  if (playerState.tickStep > 0) return;
  // The tick's last step stands for its one move in Minecraft: a box blocked falling stays blocked for the rest of it
  const friction = isOnGround ? GROUND_FRICTION : AIR_FRICTION;
  playerState.isOnGround = step.y === 0 && velocity.y < 0;
  velocity.x = step.x === 0 ? 0 : velocity.x * friction;
  velocity.y = ((step.y === 0 ? 0 : velocity.y) - GRAVITY) * VERTICAL_DRAG;
  velocity.z = step.z === 0 ? 0 : velocity.z * friction;
};
