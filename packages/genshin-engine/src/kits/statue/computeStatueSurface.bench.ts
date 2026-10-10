import type { StatueSection } from "#src/models/kits/statue/StatueSection";

import { computeStatueSurface } from "#src/kits/statue/computeStatueSurface";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// A stack's section counts, each run at the twelve angles a blade's radii are read at and the thirty-two an upright
// Stack's are
const BENCH_SECTION_COUNTS = [8, 64];
// A stack's sections at a count, each one a radius at every angle
const toSections = (count: number, angleCount: number): StatueSection[] =>
  Array.from({ length: count }, (_value, index) => ({
    centre: [0, 0],
    height: 0.1,
    radii: Array.from({ length: angleCount }, () => 1 + (index % 2) * 0.5),
  }));
// A stack's sections at each angle count, `vs base` their throughput ratio within each section count
describe(computeStatueSurface, () => {
  test.for(BENCH_SECTION_COUNTS)("%i sections", async (count, { bench }) => {
    const twelveAngles = toSections(count, 12);
    const thirtyTwoAngles = toSections(count, 32);
    await bench.compare(
      bench("12 angles", () => {
        computeStatueSurface(twelveAngles);
      }),
      bench("32 angles", () => {
        computeStatueSurface(thirtyTwoAngles);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
