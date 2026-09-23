import type { VoxelGrid } from "@/models/agentConsole/world/VoxelGrid";

import {
  COLLISION_GAP,
  PLAYER_HALF_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SNEAKING_HEIGHT,
} from "@/services/agentConsole/world/constants";
import { moveThroughGrid } from "@/services/agentConsole/world/moveThroughGrid";
import { Vector3 } from "three";
import { describe, expect, test } from "vitest";
// Three voxels along x, four up and two along z: a floor, and a pillar filling the last column
const createPillarGrid = (): VoxelGrid => {
  const width = 3;
  const height = 4;
  const voxels = new Uint8Array(width * height * 2);
  const fill = (x: number, y: number, z: number) => {
    voxels[x + width * (y + height * z)] = 1;
  };
  for (const z of [0, 1]) for (const x of [0, 1, 2]) fill(x, 0, z);
  for (const z of [0, 1]) for (const y of [1, 2, 3]) fill(2, y, z);
  return { depth: 2, height, voxels, width };
};

describe(moveThroughGrid, () => {
  test("takes a step that meets nothing", () => {
    expect.hasAssertions();

    const position = new Vector3(0.5, 1, 0.5);
    const step = new Vector3(0.1, 0, 0.1);
    moveThroughGrid(createPillarGrid(), position, step, PLAYER_HEIGHT, false);

    expect(position).toStrictEqual(new Vector3(0.5 + 0.1, 1, 0.5 + 0.1));
    expect(step).toStrictEqual(new Vector3(0.1, 0, 0.1));
  });

  test("stops short of a solid voxel and zeroes the blocked step", () => {
    expect.hasAssertions();

    const position = new Vector3(1.6, 1, 0.5);
    const step = new Vector3(0.2, 0, 0);
    moveThroughGrid(createPillarGrid(), position, step, PLAYER_HEIGHT, false);

    expect(position.x).toBe(2 - PLAYER_HALF_WIDTH - COLLISION_GAP);
    expect(step.x).toBe(0);
  });

  test("slides along what it walks into at an angle", () => {
    expect.hasAssertions();

    const position = new Vector3(1.6, 1, 0.5);
    moveThroughGrid(createPillarGrid(), position, new Vector3(0.2, 0, 0.1), PLAYER_HEIGHT, false);

    expect(position).toStrictEqual(new Vector3(2 - PLAYER_HALF_WIDTH - COLLISION_GAP, 1, 0.5 + 0.1));
  });

  test("lands on the floor", () => {
    expect.hasAssertions();

    const position = new Vector3(0.5, 1.1, 0.5);
    const step = new Vector3(0, -0.2, 0);
    moveThroughGrid(createPillarGrid(), position, step, PLAYER_HEIGHT, false);

    expect(position.y).toBe(1 + COLLISION_GAP);
    expect(step.y).toBe(0);
  });

  test("stops its head under a ceiling", () => {
    expect.hasAssertions();

    const position = new Vector3(0.5, 1, 0.5);
    const pillarGrid = createPillarGrid();
    // A ceiling over the first voxel, at the top of the grid
    pillarGrid.voxels[pillarGrid.width * (pillarGrid.height - 1)] = 1;
    moveThroughGrid(pillarGrid, position, new Vector3(0, 0.6, 0), PLAYER_SNEAKING_HEIGHT, false);

    expect(position.y).toBe(pillarGrid.height - 1 - PLAYER_SNEAKING_HEIGHT - COLLISION_GAP);
  });

  test("never leaves the floor's edge", () => {
    expect.hasAssertions();

    const position = new Vector3(0.4, 1, 0.5);
    moveThroughGrid(createPillarGrid(), position, new Vector3(-0.2, 0, 0), PLAYER_HEIGHT, false);

    expect(position.x).toBe(PLAYER_HALF_WIDTH + COLLISION_GAP);
  });

  test("holds a player at an edge that would leave nothing under the feet", () => {
    expect.hasAssertions();

    // On top of the pillar, stepping off its side
    const position = new Vector3(2.5, 4, 0.5);
    const step = new Vector3(-0.9, 0, 0);
    moveThroughGrid(createPillarGrid(), position, step, PLAYER_HEIGHT, true);

    expect(position.x).toBe(2.5);
    expect(step.x).toBe(0);
  });
});
