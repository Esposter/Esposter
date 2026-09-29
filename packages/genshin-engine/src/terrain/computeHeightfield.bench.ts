import { createSimplexNoise } from "#src/noise/createSimplexNoise";
import { computeHeightfield } from "#src/terrain/computeHeightfield";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// A tile's vertices along a side, from a far level of detail to a near one: the cost must grow with the vertices and
// Nothing else
const BENCH_RESOLUTIONS = [65, 129, 257];
const SIZE = 256;
const noise = createSimplexNoise(0);
const writeNothing = () => {};
// Flat ground against noise-shaped ground at each resolution, so `vs base` isolates what sampling heights costs
// Beyond laying the grid, its normals and its indices
describe(computeHeightfield, () => {
  test.for(BENCH_RESOLUTIONS)("%i vertices a side", async (resolution, { bench }) => {
    await bench.compare(
      bench("flat", () => {
        computeHeightfield({ getHeight: () => 0, resolution, size: SIZE, writeColor: writeNothing });
      }),
      bench("noise", () => {
        computeHeightfield({ getHeight: noise, resolution, size: SIZE, writeColor: writeNothing });
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
