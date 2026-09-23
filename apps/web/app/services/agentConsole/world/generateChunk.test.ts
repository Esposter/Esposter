import type { VoxelGrid } from "@/models/agentConsole/world/VoxelGrid";

import { PaletteColor, PaletteColors } from "@/models/agentConsole/PaletteColor";
import {
  CHUNK_BORDER,
  CHUNK_GRID_SIZE,
  DOOR_HEIGHT,
  DOOR_MAX_Z,
  DOOR_MIN_Z,
} from "@/services/agentConsole/world/constants";
import { generateChunk } from "@/services/agentConsole/world/generateChunk";
import { getChunkKey } from "@/services/agentConsole/world/getChunkKey";
import { getVoxel } from "@/services/agentConsole/world/getVoxel";
import { getWorldVoxel } from "@/services/agentConsole/world/getWorldVoxel";
import { describe, expect, test } from "vitest";

const getBorder = (voxelGrid: VoxelGrid, startX: number) =>
  Array.from({ length: voxelGrid.height * voxelGrid.depth * 2 * CHUNK_BORDER }, (_, index) =>
    getVoxel(
      voxelGrid,
      startX + (index % (2 * CHUNK_BORDER)),
      Math.floor(index / (2 * CHUNK_BORDER)) % voxelGrid.height,
      Math.floor(index / (2 * CHUNK_BORDER * voxelGrid.height)),
    ),
  );

describe(generateChunk, () => {
  test("holds the same voxels along a border as the neighbour across it", () => {
    expect.hasAssertions();

    // Across the room's left wall, so the room's stamp is held to the border as well as the ground
    const leftGrid = generateChunk(-1, 0);
    const rightGrid = generateChunk(0, 0);

    expect(getBorder(leftGrid, CHUNK_GRID_SIZE - 2 * CHUNK_BORDER)).toStrictEqual(getBorder(rightGrid, 0));
  });

  test("stamps the room with its door open onto level ground", () => {
    expect.hasAssertions();

    const voxelWorld = new Map([
      [getChunkKey(0, 0), generateChunk(0, 0)],
      [getChunkKey(-1, 0), generateChunk(-1, 0)],
    ]);
    const doorway = Array.from({ length: DOOR_HEIGHT }, (_, index) => [
      getWorldVoxel(voxelWorld, 0, index + 1, DOOR_MIN_Z),
      getWorldVoxel(voxelWorld, 0, index + 1, DOOR_MAX_Z),
    ]).flat();

    expect(doorway).toStrictEqual(Array.from({ length: 2 * DOOR_HEIGHT }, () => 0));
    expect(getWorldVoxel(voxelWorld, 0, DOOR_HEIGHT + 1, DOOR_MIN_Z)).toBe(
      PaletteColors.indexOf(PaletteColor.Wall) + 1,
    );
    // Outside the door: the ground at the room's floor, and nothing over it but the door swung open against the wall
    expect(getWorldVoxel(voxelWorld, -1, 0, DOOR_MIN_Z)).toBe(PaletteColors.indexOf(PaletteColor.Grass) + 1);
    expect(getWorldVoxel(voxelWorld, -1, 1, DOOR_MIN_Z)).toBe(0);
    expect(getWorldVoxel(voxelWorld, -1, 1, DOOR_MAX_Z + 1)).toBe(PaletteColors.indexOf(PaletteColor.Wood) + 1);
  });
});
