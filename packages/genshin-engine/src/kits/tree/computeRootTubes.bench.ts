import type { TreeRoot } from "#src/models/kits/tree/TreeRoot";

import { computeRootTubes } from "#src/kits/tree/computeRootTubes";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// A tree's few roots and four times as many, each count its own group
const BENCH_ROOT_COUNTS = [8, 32];
// A root of short spans against one four times as long at each count, `vs base` their throughput ratio within it
describe(computeRootTubes, () => {
  test.for(BENCH_ROOT_COUNTS)("%i roots", async (count, { bench }) => {
    // Each root runs out along its own heading in metre spans, tapering to its tip, so the scale is its sections
    const createRoots = (pointCount: number): TreeRoot[] =>
      Array.from({ length: count }, (_value, rootIndex) => {
        const heading = (rootIndex / count) * Math.PI * 2;
        const toPoint = (pointIndex: number): TreeRoot[number] => ({
          radius: 1 - pointIndex / pointCount,
          x: Math.cos(heading) * pointIndex,
          y: 0,
          z: Math.sin(heading) * pointIndex,
        });
        return [
          toPoint(0),
          toPoint(1),
          ...Array.from({ length: pointCount - 2 }, (_point, pointIndex) => toPoint(pointIndex + 2)),
        ];
      });
    const shortRoots = createRoots(4);
    const longRoots = createRoots(16);
    await bench.compare(
      bench("4 points a root", () => {
        computeRootTubes(shortRoots);
      }),
      bench("16 points a root", () => {
        computeRootTubes(longRoots);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
