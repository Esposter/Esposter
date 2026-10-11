import type { TreeTube } from "#src/models/kits/tree/TreeTube";

import { computeTreeTubes } from "#src/kits/tree/computeTreeTubes";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// A tree's few tubes and four times as many, each count its own group
const BENCH_TUBE_COUNTS = [8, 32];
// A tube of short spans against one four times as long at each count, `vs base` their throughput ratio within it
describe(computeTreeTubes, () => {
  test.for(BENCH_TUBE_COUNTS)("%i tubes", async (count, { bench }) => {
    // Each tube runs out along its own heading in metre spans, tapering to its tip, so the scale is its sections
    const createTubes = (pointCount: number): TreeTube[] =>
      Array.from({ length: count }, (_value, tubeIndex) => {
        const heading = (tubeIndex / count) * Math.PI * 2;
        const toPoint = (pointIndex: number): TreeTube[number] => ({
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
    const shortTubes = createTubes(4);
    const longTubes = createTubes(16);
    await bench.compare(
      bench("4 points a tube", () => {
        computeTreeTubes(shortTubes);
      }),
      bench("16 points a tube", () => {
        computeTreeTubes(longTubes);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
