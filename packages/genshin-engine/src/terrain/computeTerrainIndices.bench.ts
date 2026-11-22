import { computeTerrainIndices } from "#src/terrain/computeTerrainIndices";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// Cells along a tile's side at one size under the sixteen-bit index limit and one past it, so both arrays are timed.
// The bare allocation of the index count is the floor the fill is measured against
const BENCH_CELLS_PER_SIDE = [32, 256];
describe(computeTerrainIndices, () => {
  test.for(BENCH_CELLS_PER_SIDE)("%i cells a side", async (cellsPerSide, { bench }) => {
    const indexCount = cellsPerSide * cellsPerSide * 6;
    await bench.compare(
      bench("allocate", () => new Uint32Array(indexCount)),
      bench("computeTerrainIndices", () => {
        computeTerrainIndices(cellsPerSide);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
