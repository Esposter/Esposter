import { createBenchDataSource } from "@/composables/resource/sheet/commands/createBenchDataSource.bench";
import { generateBenchRows } from "@/composables/resource/sheet/commands/generateBenchRows.bench";
import { KeepDuplicateMode } from "@/models/resource/sheet/commands/KeepDuplicateMode";
import { findDuplicateRows } from "@/services/resource/sheet/commands/findDuplicateRows";
import { bench, describe } from "vitest";

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
  describe.each(BENCH_ROW_COUNTS)("%i rows", (rowCount) => {
    for (const [shapeTitle, getUniqueValueCount] of DUPLICATE_SHAPES) {
      // Shared across this group's tasks rather than rebuilt per iteration: finding duplicates reads the data
      // Source and writes nothing, so no iteration can see another's state.
      const dataSource = createBenchDataSource(
        generateBenchRows(rowCount, { uniqueValues: getUniqueValueCount(rowCount) }),
      );
      for (const keepMode of KEEP_DUPLICATE_MODES)
        bench(`${shapeTitle} — ${keepMode} mode`, () => {
          findDuplicateRows(dataSource, keepMode);
        });
    }
  });
});
