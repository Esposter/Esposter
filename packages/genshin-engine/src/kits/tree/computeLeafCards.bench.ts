import { computeLeafCards } from "#src/kits/tree/computeLeafCards";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { Vector3 } from "three";
import { describe, test } from "vitest";

// A crown's clusters and four times as many: the cost must grow with the cards and nothing else
const BENCH_CLUSTER_COUNTS = [16, 64];
// A sparse cluster against a dense one, so `vs base` shows a card costs the same in either
describe(computeLeafCards, () => {
  test.for(BENCH_CLUSTER_COUNTS)("%i clusters", async (count, { bench }) => {
    const clusterCenters = Array.from({ length: count }, (_value, index) => new Vector3(index, 0, 0));
    await bench.compare(
      bench("8 cards a cluster", () => {
        computeLeafCards(clusterCenters, { cardSize: 1, cardsPerCluster: 8, clusterRadius: 1, seed: 0 });
      }),
      bench("32 cards a cluster", () => {
        computeLeafCards(clusterCenters, { cardSize: 1, cardsPerCluster: 32, clusterRadius: 1, seed: 0 });
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
