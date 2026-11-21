import { computeNoiseSamples } from "#src/audio/computeNoiseSamples";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// One band sounding against all eight: the inverse transform is the same length either way, so the cost is that
// Transform plus the bins of each band that sounds
const BENCH_BAND_COUNTS = [1, 8];
// A silent noise against one with every band lit at each count, so `vs base` isolates what lighting the bands costs
describe(computeNoiseSamples, () => {
  const sampleRate = 44_100;

  test.for(BENCH_BAND_COUNTS)("%i bands", async (count, { bench }) => {
    const silentBands = Array.from({ length: count }, () => 0);
    const litBands = Array.from({ length: count }, () => 1);
    await bench.compare(
      bench("silent", () => {
        computeNoiseSamples(silentBands, sampleRate);
      }),
      bench("lit", () => {
        computeNoiseSamples(litBands, sampleRate);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
