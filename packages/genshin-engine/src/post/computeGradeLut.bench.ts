import { computeGradeLut } from "#src/post/computeGradeLut";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// The cube's side at a small grade and at a fine one: the cost must grow with the texels and nothing else
const BENCH_SIZES = [16, 32];
// A neutral grade against a full one at each size, so `vs base` isolates what grading costs beyond laying the cube
describe(computeGradeLut, () => {
  test.for(BENCH_SIZES)("%i texels a side", async (size, { bench }) => {
    await bench.compare(
      bench("neutral", () => {
        computeGradeLut({ contrast: 1, highlightTint: [0, 0, 0], saturation: 1, shadowTint: [0, 0, 0], size });
      }),
      bench("graded", () => {
        computeGradeLut({ contrast: 1.1, highlightTint: [0.1, 0, 0], saturation: 1.2, shadowTint: [0, 0, 0.1], size });
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
