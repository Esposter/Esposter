import { createSurvivorIndices } from "#src/culling/createSurvivorIndices";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// An instance count at each scale, since the list holds one slot per instance and its cost must follow the count alone
// A bare allocation of the same length is the floor the fill is measured against
const BENCH_INSTANCE_COUNTS = [1000, 100_000];
describe(createSurvivorIndices, () => {
  test.for(BENCH_INSTANCE_COUNTS)("%i instances", async (count, { bench }) => {
    await bench.compare(
      bench("allocate", () => new Uint32Array(count)),
      bench("createSurvivorIndices", () => {
        createSurvivorIndices(count);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
