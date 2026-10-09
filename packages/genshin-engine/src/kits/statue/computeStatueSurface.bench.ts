import type { StatueSection } from "#src/models/kits/statue/StatueSection";

import { computeStatueSurface } from "#src/kits/statue/computeStatueSurface";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// A part's section counts, each run at the sixteen and the thirty-two angles a section's radii may be read at
const BENCH_SECTION_COUNTS = [8, 64];
// A part's sections at a count, each one a radius at every angle
const toSections = (count: number, angleCount: number): StatueSection[] =>
  Array.from({ length: count }, (_value, index) => ({
    height: 0.1,
    radii: Array.from({ length: angleCount }, () => 1 + (index % 2) * 0.5),
  }));
// A part's sections at each angle count, `vs base` their throughput ratio within each section count
describe(computeStatueSurface, () => {
  test.for(BENCH_SECTION_COUNTS)("%i sections", async (count, { bench }) => {
    const sixteenAngles = toSections(count, 16);
    const thirtyTwoAngles = toSections(count, 32);
    await bench.compare(
      bench("16 angles", () => {
        computeStatueSurface(sixteenAngles);
      }),
      bench("32 angles", () => {
        computeStatueSurface(thirtyTwoAngles);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
