import { computeTerrainIndices } from "#src/terrain/computeTerrainIndices";
import { writeTerrainRingIndices } from "#src/terrain/writeTerrainRingIndices";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// The tiles a ring draws: the cost must grow with them, and never with the ring's held tiles, which it is not given
const BENCH_DRAWN_COUNTS = [8, 64];
const COARSE_CELLS_PER_SIDE = 32;
const FINE_CELLS_PER_SIDE = 64;
const coarseIndices = computeTerrainIndices(COARSE_CELLS_PER_SIDE);
const fineIndices = computeTerrainIndices(FINE_CELLS_PER_SIDE);
const coarseVertexCount = (COARSE_CELLS_PER_SIDE + 1) ** 2;
const fineVertexCount = (FINE_CELLS_PER_SIDE + 1) ** 2;
// A ring's drawn tiles, by their ordinals in the ring
const createDrawnOrdinals = (drawnCount: number): number[] =>
  Array.from({ length: drawnCount }, (_value, ordinal) => ordinal);
// One test per drawn count, the grids compared within it. The index is built per call, since each call writes into it
describe(writeTerrainRingIndices, () => {
  test.for(BENCH_DRAWN_COUNTS)("%i drawn tiles", async (drawnCount, { bench }) => {
    const drawnOrdinals = createDrawnOrdinals(drawnCount);
    await bench.compare(
      bench(`${COARSE_CELLS_PER_SIDE} cells a side`, () => {
        const ringIndices = new Uint32Array(drawnCount * coarseIndices.length);
        writeTerrainRingIndices(ringIndices, coarseIndices, drawnOrdinals, coarseVertexCount);
      }),
      bench(`${FINE_CELLS_PER_SIDE} cells a side`, () => {
        const ringIndices = new Uint32Array(drawnCount * fineIndices.length);
        writeTerrainRingIndices(ringIndices, fineIndices, drawnOrdinals, fineVertexCount);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
