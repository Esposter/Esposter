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
    const leftGrid = generateChunk({ chunkX: -1, chunkZ: 0 });
    const rightGrid = generateChunk({ chunkX: 0, chunkZ: 0 });

    expect(getBorder(leftGrid, CHUNK_GRID_SIZE - 2 * CHUNK_BORDER)).toStrictEqual(getBorder(rightGrid, 0));
  });

  test("leaves the door's opening in its wall clear, on level ground", () => {
    expect.hasAssertions();

    const voxelWorld = new Map([
      [getChunkKey(0, 0), generateChunk({ chunkX: 0, chunkZ: 0 })],
      [getChunkKey(-1, 0), generateChunk({ chunkX: -1, chunkZ: 0 })],
    ]);
    // The opening, and a player's height either side of it, which nothing the room is furnished with may stand in
    const doorway = [-1, 0, 1].flatMap((x) =>
      Array.from({ length: DOOR_HEIGHT }, (_, index) =>
        [DOOR_MIN_Z, DOOR_MAX_Z].map((z) => getWorldVoxel(voxelWorld, x, index + 1, z)),
      ).flat(),
    );

    expect(doorway).toStrictEqual(Array.from({ length: 3 * 2 * DOOR_HEIGHT }, () => 0));
    // The lintel over the opening, and the ground outside it
    expect(getWorldVoxel(voxelWorld, 0, DOOR_HEIGHT + 1, DOOR_MIN_Z)).toBe(
      PaletteColors.indexOf(PaletteColor.Wood) + 1,
    );
    expect(getWorldVoxel(voxelWorld, -1, 0, DOOR_MIN_Z)).toBe(PaletteColors.indexOf(PaletteColor.Grass) + 1);
  });
});
