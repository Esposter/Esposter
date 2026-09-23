import type { PlayerActions } from "@/models/agentConsole/world/PlayerActions";
import type { VoxelBox } from "@/models/agentConsole/world/VoxelBox";

import { PaletteColor } from "@/models/agentConsole/PaletteColor";
import { COLLISION_GAP, PLAYER_HALF_WIDTH, STEPS_PER_TICK } from "@/services/agentConsole/world/constants";
import { createPlayerState } from "@/services/agentConsole/world/createPlayerState";
import { createVoxelWorld } from "@/services/agentConsole/world/createVoxelWorld.test";
import { simulatePlayer } from "@/services/agentConsole/world/simulatePlayer";
import { describe, expect, test } from "vitest";

describe(simulatePlayer, () => {
  // A floor along x, and a step one voxel tall over its far part
  const floor: VoxelBox = { color: PaletteColor.Stone, max: [8, 0, 0], min: [0, 0, 0] };
  const oneVoxelStep: VoxelBox = { color: PaletteColor.Stone, max: [8, 1, 0], min: [3, 1, 0] };
  const voxelWorld = createVoxelWorld([floor, oneVoxelStep]);
  // A second of Minecraft's ticks
  const stepCount = 20 * STEPS_PER_TICK;

  test("jumps from against a one-voxel step onto it", () => {
    expect.hasAssertions();

    const playerState = createPlayerState();
    playerState.position.set(3 - PLAYER_HALF_WIDTH - COLLISION_GAP, 1, 0.5);
    const actions: PlayerActions = { isJumping: true, isSneaking: false, isSprinting: false };
    simulatePlayer(voxelWorld, playerState, actions, 1, 0);
    actions.isJumping = false;
    for (let index = 1; index < stepCount; index++) simulatePlayer(voxelWorld, playerState, actions, 1, 0);

    expect(playerState.position.y).toBe(2 + COLLISION_GAP);
    expect(playerState.isOnGround).toBe(true);
  });
});
