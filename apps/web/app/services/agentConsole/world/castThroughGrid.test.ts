import { PaletteColor } from "@/models/agentConsole/PaletteColor";
import { castThroughGrid } from "@/services/agentConsole/world/castThroughGrid";
import { createVoxelWorld } from "@/services/agentConsole/world/createVoxelWorld.test";
import { Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(castThroughGrid, () => {
  const origin = new Vector3(0.5, 0.5, 0.5);
  const direction = new Vector3(1, 0, 0);

  test("reaches the face of the first solid voxel on its way", () => {
    expect.hasAssertions();

    const voxelWorld = createVoxelWorld([{ color: PaletteColor.Stone, max: [2, 0, 0], min: [2, 0, 0] }]);
    const distance = castThroughGrid(voxelWorld, origin, direction, Infinity);

    expect(distance).toBe(1.5);
  });

  test("goes as far as it is let through open voxels", () => {
    expect.hasAssertions();

    const voxelWorld = createVoxelWorld([]);
    const distance = castThroughGrid(voxelWorld, origin, direction, 1);

    expect(distance).toBe(1);
  });
});
