import type { VoxelGrid } from "@/models/agentConsole/world/VoxelGrid";

import { COLLISION_GAP, PLAYER_HALF_WIDTH } from "@/services/agentConsole/world/constants";
import { moveThroughGrid } from "@/services/agentConsole/world/moveThroughGrid";
import { Vector3 } from "three";
import { describe, expect, test } from "vitest";

// Three voxels along x and two along z over an open floor, with a pillar filling the last column
const createPillarGrid = (): VoxelGrid => {
  const voxels = new Uint8Array(3 * 3 * 2);
  for (const z of [0, 1]) for (const y of [1, 2]) voxels[2 + 3 * (y + 3 * z)] = 1;
  return { depth: 2, height: 3, voxels, width: 3 };
};

describe(moveThroughGrid, () => {
  test("takes a step that meets nothing", () => {
    expect.hasAssertions();

    const position = new Vector3(0.5, 1, 0.5);
    moveThroughGrid(createPillarGrid(), position, 0.1, 0.1);

    expect(position).toStrictEqual(new Vector3(0.5 + 0.1, 1, 0.5 + 0.1));
  });

  test("stops a step short of a solid voxel", () => {
    expect.hasAssertions();

    const position = new Vector3(1.6, 1, 0.5);
    moveThroughGrid(createPillarGrid(), position, 0.2, 0);

    expect(position.x).toBe(2 - PLAYER_HALF_WIDTH - COLLISION_GAP);
  });

  test("slides along what it walks into at an angle", () => {
    expect.hasAssertions();

    const position = new Vector3(1.6, 1, 0.5);
    moveThroughGrid(createPillarGrid(), position, 0.2, 0.1);

    expect(position).toStrictEqual(new Vector3(2 - PLAYER_HALF_WIDTH - COLLISION_GAP, 1, 0.5 + 0.1));
  });

  test("never leaves the floor", () => {
    expect.hasAssertions();

    const position = new Vector3(0.4, 1, 0.5);
    moveThroughGrid(createPillarGrid(), position, -0.2, 0);

    expect(position.x).toBe(PLAYER_HALF_WIDTH + COLLISION_GAP);
  });
});
