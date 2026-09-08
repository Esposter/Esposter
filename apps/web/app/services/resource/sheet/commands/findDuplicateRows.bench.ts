import { createBenchDataSource } from "@/composables/resource/sheet/commands/createBenchDataSource.bench";
import { generateBenchRows } from "@/composables/resource/sheet/commands/generateBenchRows.bench";
import { KeepDuplicateMode } from "@/models/resource/sheet/commands/KeepDuplicateMode";
import { findDuplicateRows } from "@/services/resource/sheet/commands/findDuplicateRows";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

const BENCH_ROW_COUNTS = [100, 1000, 10000];
// How many distinct values the generated rows carry, as a function of the row count: the axis this function is
// Actually sensitive to, since it groups rows by their values.
const DUPLICATE_SHAPES: [string, (rowCount: number) => number][] = [
  ["all unique", (rowCount) => rowCount],
  ["half duplicates", (rowCount) => rowCount / 2],
  ["all duplicates", () => 1],
];
const KEEP_DUPLICATE_MODES = [KeepDuplicateMode.First, KeepDuplicateMode.Last];
// One group per row count so every task in a group shares the same scale: mean (ms) is directly comparable and
// `vs base` isolates the shape×mode sensitivity (0% / 50% / 100% duplicates × First/Last) against the
// All-unique-First baseline, instead of conflating shape with scale.
describe(findDuplicateRows, () => {
  test.for(BENCH_ROW_COUNTS)("%i rows", async (rowCount, { bench }) => {
    const registrations = DUPLICATE_SHAPES.flatMap(([shapeTitle, getUniqueValueCount]) => {
      // Shared across this group's tasks rather than rebuilt per iteration: finding duplicates reads the data
      // Source and writes nothing, so no iteration can see another's state.
      const dataSource = createBenchDataSource(
        generateBenchRows(rowCount, { uniqueValues: getUniqueValueCount(rowCount) }),
      );
      return KEEP_DUPLICATE_MODES.map((keepMode) =>
        bench(`${shapeTitle} — ${keepMode} mode`, () => {
          findDuplicateRows(dataSource, keepMode);
        }),
      );
    });
    await bench.compare(...registrations, BENCHMARK_RUN_OPTIONS);
  });
});
