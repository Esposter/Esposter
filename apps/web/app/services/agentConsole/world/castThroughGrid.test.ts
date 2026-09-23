import { castThroughGrid } from "@/services/agentConsole/world/castThroughGrid";
import { Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(castThroughGrid, () => {
  const direction = new Vector3(1, 0, 0);

  test("reaches the face of the first solid voxel on its way", () => {
    expect.hasAssertions();

    const distance = castThroughGrid(
      { depth: 1, height: 1, voxels: Uint8Array.of(0, 0, 1), width: 3 },
      new Vector3(0.5, 0.5, 0.5),
      direction,
      Infinity,
    );

    expect(distance).toBe(1.5);
  });

  test("goes as far as it is let through open voxels", () => {
    expect.hasAssertions();

    const distance = castThroughGrid(
      { depth: 1, height: 1, voxels: Uint8Array.of(0, 0, 0), width: 3 },
      new Vector3(0.5, 0.5, 0.5),
      direction,
      1,
    );

    expect(distance).toBe(1);
  });
});
