import { computeLeafCards } from "#src/kits/tree/computeLeafCards";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// A crown's clusters and four times as many, each count its own group
const BENCH_CLUSTER_COUNTS = [16, 64];
// A sparse cluster against one four times as dense at each count, `vs base` their throughput ratio within it
describe(computeLeafCards, () => {
  test.for(BENCH_CLUSTER_COUNTS)("%i clusters", async (count, { bench }) => {
    const clusters = Array.from({ length: count }, (_value, index) => ({ radius: 1, x: index, y: 0, z: 0 }));
    await bench.compare(
      bench("8 cards a cluster", () => {
        computeLeafCards(clusters, { cardSize: 1, cardsPerCluster: 8, seed: 0 });
      }),
      bench("32 cards a cluster", () => {
        computeLeafCards(clusters, { cardSize: 1, cardsPerCluster: 32, seed: 0 });
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
