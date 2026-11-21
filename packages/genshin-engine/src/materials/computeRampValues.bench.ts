import { computeRampValues } from "#src/materials/computeRampValues";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// The toon ramp at the resolution the characters and the windrise use, and one eight times finer: the cost must grow
// With the texels and nothing else
const BENCH_RESOLUTIONS = [64, 512];
// A ramp dark in shade and one that keeps a tone there, the two shapes `getSharedToonRamp` builds
describe(computeRampValues, () => {
  test.for(BENCH_RESOLUTIONS)("%i texels", async (resolution, { bench }) => {
    await bench.compare(
      bench("dark in shade", () => {
        computeRampValues({ resolution, shade: 0, softness: 0.08, terminator: 0.52 });
      }),
      bench("keeps a tone in shade", () => {
        computeRampValues({ resolution, shade: 0.5, softness: 0.08, terminator: 0.52 });
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
