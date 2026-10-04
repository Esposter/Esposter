import { transformFourier } from "#src/audio/transformFourier";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// A short signal and the length an instrument's noise is built at: the cost must grow as the length times its bits
const BENCH_LENGTH_BITS = [12, 16];
// A spectrum of one bin against one with every bin set, so `vs base` shows the cost follows the length alone
describe(transformFourier, () => {
  test.for(BENCH_LENGTH_BITS)("2^%i samples", async (bits, { bench }) => {
    const length = 2 ** bits;
    const real = new Float64Array(length);
    const imaginary = new Float64Array(length);
    await bench.compare(
      bench("one bin", () => {
        real.fill(0);
        imaginary.fill(0);
        real[1] = 1;
        transformFourier(real, imaginary);
      }),
      bench("every bin", () => {
        real.fill(1);
        imaginary.fill(0);
        transformFourier(real, imaginary);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
