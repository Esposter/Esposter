import {
  benchDataSource1kHalfDuplicates,
  benchDataSource10kHalfDuplicates,
  benchDataSource100HalfDuplicates,
} from "@/composables/tableEditor/file/commands/testUtils.bench";
import { KeepDuplicateMode } from "@/models/tableEditor/file/commands/KeepDuplicateMode";
import { findDuplicateRows } from "@/services/tableEditor/file/commands/findDuplicateRows";
import { bench, describe } from "vitest";

describe(findDuplicateRows, () => {
  bench("First mode — 100 rows, 50 unique", () => {
    findDuplicateRows(benchDataSource100HalfDuplicates, KeepDuplicateMode.First);
  });

  bench("Last mode — 100 rows, 50 unique", () => {
    findDuplicateRows(benchDataSource100HalfDuplicates, KeepDuplicateMode.Last);
  });

  bench("First mode — 1000 rows, 500 unique", () => {
    findDuplicateRows(benchDataSource1kHalfDuplicates, KeepDuplicateMode.First);
  });

  bench("Last mode — 1000 rows, 500 unique", () => {
    findDuplicateRows(benchDataSource1kHalfDuplicates, KeepDuplicateMode.Last);
  });

  bench("First mode — 10000 rows, 5000 unique", () => {
    findDuplicateRows(benchDataSource10kHalfDuplicates, KeepDuplicateMode.First);
  });

  bench("Last mode — 10000 rows, 5000 unique", () => {
    findDuplicateRows(benchDataSource10kHalfDuplicates, KeepDuplicateMode.Last);
  });
});
