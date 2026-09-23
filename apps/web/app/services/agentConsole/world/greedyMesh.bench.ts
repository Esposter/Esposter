import type { VoxelGrid } from "@/models/agentConsole/world/VoxelGrid";

import { CHUNK_BORDER } from "@/services/agentConsole/world/constants";
import { generateChunk } from "@/services/agentConsole/world/generateChunk";
import { greedyMesh } from "@/services/agentConsole/world/greedyMesh";
import { PaletteRgbs } from "@/services/agentConsole/world/PaletteRgbs";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

const BENCH_CHUNK_SIZES = [16, 32];
// A cube of one colour merges into six quads, the best case; alternating voxels leave nothing to merge and every face
// Showing, the worst
const createChunkGrid = (size: number, getVoxel: (index: number) => number): VoxelGrid => ({
  depth: size,
  height: size,
  voxels: Uint8Array.from({ length: size ** 3 }, (_, index) => getVoxel(index)),
  width: size,
});
// Meshing reads the grid and writes nothing, so each group's grids are built once and shared by its iterations
describe(greedyMesh, () => {
  test.for(BENCH_CHUNK_SIZES)("%i³ chunk", async (size, { bench }) => {
    const solidGrid = createChunkGrid(size, () => 1);
    const checkerboardGrid = createChunkGrid(size, (index) => {
      const x = index % size;
      const y = Math.floor(index / size) % size;
      const z = Math.floor(index / size ** 2);
      return (x + y + z) % 2;
    });
    await bench.compare(
      bench("solid", () => {
        greedyMesh(solidGrid, PaletteRgbs);
      }),
      bench("checkerboard", () => {
        greedyMesh(checkerboardGrid, PaletteRgbs);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });

  // A chunk of the world as the worker meshes it, inside its border of its neighbours' voxels: the room's, and the hills'
  test("terrain chunk", async ({ bench }) => {
    const spawnGrid = generateChunk({ chunkX: 0, chunkZ: 0, isDoorOpen: false });
    const hillsGrid = generateChunk({ chunkX: 3, chunkZ: 2, isDoorOpen: false });
    await bench.compare(
      bench("spawn", () => {
        greedyMesh(spawnGrid, PaletteRgbs, CHUNK_BORDER);
      }),
      bench("hills", () => {
        greedyMesh(hillsGrid, PaletteRgbs, CHUNK_BORDER);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
