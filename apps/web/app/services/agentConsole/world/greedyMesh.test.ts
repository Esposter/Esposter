import { greedyMesh } from "@/services/agentConsole/world/greedyMesh";
import { describe, expect, test } from "vitest";

describe(greedyMesh, () => {
  const rgbs: [number, number, number][] = [
    [1, 1, 1],
    [0, 0, 0],
  ];

  test("merges a block of one colour into one quad a side", () => {
    expect.hasAssertions();

    const voxelMesh = greedyMesh({ depth: 2, height: 2, voxels: new Uint8Array(8).fill(1), width: 2 }, rgbs);

    expect(voxelMesh.indices).toHaveLength(6 * 6);
    expect(voxelMesh.positions).toHaveLength(6 * 4 * 3);
  });

  test("drops the face two voxels share and keeps two colours apart", () => {
    expect.hasAssertions();

    const voxelMesh = greedyMesh({ depth: 1, height: 1, voxels: Uint8Array.of(1, 2), width: 2 }, rgbs);

    expect(voxelMesh.indices).toHaveLength(10 * 6);
  });

  test("meshes inside the border alone, placed from its inner corner", () => {
    expect.hasAssertions();

    const voxelMesh = greedyMesh({ depth: 3, height: 1, voxels: new Uint8Array(9).fill(1), width: 3 }, rgbs, 1);
    const xPositions = voxelMesh.positions.filter((_value, index) => index % 3 === 0);

    expect(new Set(xPositions)).toStrictEqual(new Set([0, 1]));
  });

  test("shades a face by the way it faces, and a corner by the solid voxels beside it", () => {
    expect.hasAssertions();

    const openColors = greedyMesh({ depth: 1, height: 1, voxels: Uint8Array.of(1), width: 1 }, rgbs).colors;
    // An L: the voxel stacked on the left darkens the corners of the right one's top that touch it
    const cornerColors = greedyMesh({ depth: 1, height: 2, voxels: Uint8Array.of(1, 1, 1, 0), width: 2 }, rgbs).colors;

    expect(new Set(openColors)).toStrictEqual(new Set([0.5, 0.65, 0.8, 1].map((shade) => Math.fround(shade))));
    expect(cornerColors).toContain(Math.fround(0.85));
  });
});
