import type { VoxelBox } from "@/models/agentConsole/world/VoxelBox";
import type { WorldBox } from "@/models/agentConsole/world/WorldBox";

import { PaletteColor } from "@/models/agentConsole/PaletteColor";
import {
  COLLISION_GAP,
  PLAYER_HALF_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SNEAKING_HEIGHT,
} from "@/services/agentConsole/world/constants";
import { createVoxelWorld } from "@/services/agentConsole/world/createVoxelWorld.test";
import { moveThroughGrid } from "@/services/agentConsole/world/moveThroughGrid";
import { Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(moveThroughGrid, () => {
  // A floor three voxels along x and two along z, and a pillar three voxels tall on its last column
  const floor: VoxelBox = { color: PaletteColor.Stone, max: [2, 0, 1], min: [0, 0, 0] };
  const pillar: VoxelBox = { color: PaletteColor.Stone, max: [2, 3, 1], min: [2, 1, 0] };
  const voxelWorld = createVoxelWorld([floor, pillar]);

  test("takes a step that meets nothing", () => {
    expect.hasAssertions();

    const position = new Vector3(0.5, 1, 0.5);
    const step = new Vector3(0.1, 0, 0.1);
    moveThroughGrid(voxelWorld, [], position, step, PLAYER_HEIGHT, false);

    expect(position).toStrictEqual(new Vector3(0.5 + 0.1, 1, 0.5 + 0.1));
    expect(step).toStrictEqual(new Vector3(0.1, 0, 0.1));
  });

  test("stops short of a solid voxel and zeroes the blocked step", () => {
    expect.hasAssertions();

    const position = new Vector3(1.6, 1, 0.5);
    const step = new Vector3(0.2, 0, 0);
    moveThroughGrid(voxelWorld, [], position, step, PLAYER_HEIGHT, false);

    expect(position.x).toBeCloseTo(2 - PLAYER_HALF_WIDTH - COLLISION_GAP);
    expect(step.x).toBe(0);
  });

  test("slides along what it walks into at an angle", () => {
    expect.hasAssertions();

    const position = new Vector3(1.6, 1, 0.5);
    moveThroughGrid(voxelWorld, [], position, new Vector3(0.2, 0, 0.1), PLAYER_HEIGHT, false);

    expect(position.x).toBeCloseTo(2 - PLAYER_HALF_WIDTH - COLLISION_GAP);
    expect(position.z).toBe(0.5 + 0.1);
  });

  test("lands on the floor", () => {
    expect.hasAssertions();

    const position = new Vector3(0.5, 1.1, 0.5);
    const step = new Vector3(0, -0.2, 0);
    moveThroughGrid(voxelWorld, [], position, step, PLAYER_HEIGHT, false);

    expect(position.y).toBeCloseTo(1 + COLLISION_GAP);
    expect(step.y).toBe(0);
  });

  test("stops its head under a ceiling", () => {
    expect.hasAssertions();

    const position = new Vector3(0.5, 1, 0.5);
    // A ceiling over the first voxel, as high as the pillar
    const ceilingWorld = createVoxelWorld([
      floor,
      pillar,
      { color: PaletteColor.Stone, max: [0, 3, 0], min: [0, 3, 0] },
    ]);
    moveThroughGrid(ceilingWorld, [], position, new Vector3(0, 0.6, 0), PLAYER_SNEAKING_HEIGHT, false);

    expect(position.y).toBeCloseTo(3 - PLAYER_SNEAKING_HEIGHT - COLLISION_GAP);
  });

  test("lands on the ground of a chunk not generated yet", () => {
    expect.hasAssertions();

    const position = new Vector3(-0.5, 1.1, 0.5);
    moveThroughGrid(voxelWorld, [], position, new Vector3(0, -0.2, 0), PLAYER_HEIGHT, false);

    expect(position.y).toBeCloseTo(1 + COLLISION_GAP);
  });

  test("holds a player at an edge that would leave nothing under the feet", () => {
    expect.hasAssertions();

    // On top of the pillar, stepping off its side
    const position = new Vector3(2.5, 4, 0.5);
    const step = new Vector3(-0.9, 0, 0);
    moveThroughGrid(voxelWorld, [], position, step, PLAYER_HEIGHT, true);

    expect(position.x).toBe(2.5);
    expect(step.x).toBe(0);
  });

  test("stops at a box drawn apart from the voxels as it stops at a voxel", () => {
    expect.hasAssertions();

    // A thin panel standing across the floor, as the door does
    const worldBox: WorldBox = { max: [1.2, 3, 2], min: [1.1, 1, 0] };
    const position = new Vector3(0.5, 1, 0.5);
    const step = new Vector3(0.5, 0, 0);
    moveThroughGrid(voxelWorld, [worldBox], position, step, PLAYER_HEIGHT, false);

    expect(position.x).toBeCloseTo(1.1 - PLAYER_HALF_WIDTH - COLLISION_GAP);
    expect(step.x).toBe(0);
  });

  test("never traps a player inside a box, as a door closed on them", () => {
    expect.hasAssertions();

    const worldBox: WorldBox = { max: [1, 3, 2], min: [0, 1, 0] };
    const position = new Vector3(0.5, 1, 0.5);
    const step = new Vector3(0.1, 0, 0);
    moveThroughGrid(voxelWorld, [worldBox], position, step, PLAYER_HEIGHT, false);

    expect(position.x).toBe(0.5 + 0.1);
  });
});
