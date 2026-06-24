import {
  benchDataSource1kAllDuplicates,
  benchDataSource1kAllUnique,
  benchDataSource1kHalfDuplicates,
  benchDataSource10kAllDuplicates,
  benchDataSource10kAllUnique,
  benchDataSource10kHalfDuplicates,
  benchDataSource100AllDuplicates,
  benchDataSource100AllUnique,
  benchDataSource100HalfDuplicates,
} from "@/composables/tableEditor/file/commands/constants.bench";
import { KeepDuplicateMode } from "@/models/tableEditor/file/commands/KeepDuplicateMode";
import { findDuplicateRows } from "@/services/tableEditor/file/commands/findDuplicateRows";
import { bench, describe } from "vitest";
// One group per row count so every task in a group shares the same scale: mean (ms) is directly
// Comparable and `vs base` isolates the shape×mode sensitivity (0% / 50% / 100% duplicates × First/Last)
// Against the all-unique-First baseline, instead of conflating shape with scale.
describe(findDuplicateRows, () => {
  describe("100 rows", () => {
    bench("All unique — First mode", () => {
      findDuplicateRows(benchDataSource100AllUnique, KeepDuplicateMode.First);
    });

    bench("All unique — Last mode", () => {
      findDuplicateRows(benchDataSource100AllUnique, KeepDuplicateMode.Last);
    });

    bench("Half duplicates — First mode", () => {
      findDuplicateRows(benchDataSource100HalfDuplicates, KeepDuplicateMode.First);
    });

    bench("Half duplicates — Last mode", () => {
      findDuplicateRows(benchDataSource100HalfDuplicates, KeepDuplicateMode.Last);
    });

    bench("All duplicates — First mode", () => {
      findDuplicateRows(benchDataSource100AllDuplicates, KeepDuplicateMode.First);
    });

    bench("All duplicates — Last mode", () => {
      findDuplicateRows(benchDataSource100AllDuplicates, KeepDuplicateMode.Last);
    });
  });

  describe("1000 rows", () => {
    bench("All unique — First mode", () => {
      findDuplicateRows(benchDataSource1kAllUnique, KeepDuplicateMode.First);
    });

    bench("All unique — Last mode", () => {
      findDuplicateRows(benchDataSource1kAllUnique, KeepDuplicateMode.Last);
    });

    bench("Half duplicates — First mode", () => {
      findDuplicateRows(benchDataSource1kHalfDuplicates, KeepDuplicateMode.First);
    });

    bench("Half duplicates — Last mode", () => {
      findDuplicateRows(benchDataSource1kHalfDuplicates, KeepDuplicateMode.Last);
    });

    bench("All duplicates — First mode", () => {
      findDuplicateRows(benchDataSource1kAllDuplicates, KeepDuplicateMode.First);
    });

    bench("All duplicates — Last mode", () => {
      findDuplicateRows(benchDataSource1kAllDuplicates, KeepDuplicateMode.Last);
    });
  });

  describe("10000 rows", () => {
    bench("All unique — First mode", () => {
      findDuplicateRows(benchDataSource10kAllUnique, KeepDuplicateMode.First);
    });

    bench("All unique — Last mode", () => {
      findDuplicateRows(benchDataSource10kAllUnique, KeepDuplicateMode.Last);
    });

    bench("Half duplicates — First mode", () => {
      findDuplicateRows(benchDataSource10kHalfDuplicates, KeepDuplicateMode.First);
    });

    bench("Half duplicates — Last mode", () => {
      findDuplicateRows(benchDataSource10kHalfDuplicates, KeepDuplicateMode.Last);
    });

    bench("All duplicates — First mode", () => {
      findDuplicateRows(benchDataSource10kAllDuplicates, KeepDuplicateMode.First);
    });

    bench("All duplicates — Last mode", () => {
      findDuplicateRows(benchDataSource10kAllDuplicates, KeepDuplicateMode.Last);
    });
  });
});
