import { createLoginTowerSlabGeometry } from "#src/services/login/tower/createLoginTowerSlabGeometry";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

describe(createLoginTowerSlabGeometry, () => {
  // A tower's breadth in facade cells, and a slab as wide as a window's four cells or the whole turn round it
  const BENCH_BREADTH = 100;
  const BENCH_WINDOW_CELLS = 4;

  test("a window's span against the whole turn", async ({ bench }) => {
    await bench.compare(
      bench("4 cells", () => {
        createLoginTowerSlabGeometry([1, 0.1, 0, BENCH_WINDOW_CELLS, 0, 1], BENCH_BREADTH);
      }),
      bench("the whole turn", () => {
        createLoginTowerSlabGeometry([1, 0.1, 0, BENCH_BREADTH, 0, 1], BENCH_BREADTH);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
