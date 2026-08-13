import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

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
} from "@/composables/resource/sheet/commands/constants.bench";
import { KeepDuplicateMode } from "@/models/resource/sheet/commands/KeepDuplicateMode";
import { findDuplicateRows } from "@/services/resource/sheet/commands/findDuplicateRows";
import { bench, describe } from "vitest";

const benchRowCountGroups: { shapes: [string, DataSource][]; title: string }[] = [
  {
    shapes: [
      ["all unique", benchDataSource100AllUnique],
      ["half duplicates", benchDataSource100HalfDuplicates],
      ["all duplicates", benchDataSource100AllDuplicates],
    ],
    title: "100 rows",
  },
  {
    shapes: [
      ["all unique", benchDataSource1kAllUnique],
      ["half duplicates", benchDataSource1kHalfDuplicates],
      ["all duplicates", benchDataSource1kAllDuplicates],
    ],
    title: "1000 rows",
  },
  {
    shapes: [
      ["all unique", benchDataSource10kAllUnique],
      ["half duplicates", benchDataSource10kHalfDuplicates],
      ["all duplicates", benchDataSource10kAllDuplicates],
    ],
    title: "10000 rows",
  },
];
const keepDuplicateModes = [KeepDuplicateMode.First, KeepDuplicateMode.Last];
// One group per row count so every task in a group shares the same scale: mean (ms) is directly
// Comparable and `vs base` isolates the shape×mode sensitivity (0% / 50% / 100% duplicates × First/Last)
// Against the all-unique-First baseline, instead of conflating shape with scale.
describe(findDuplicateRows, () => {
  describe.each(benchRowCountGroups)("$title", ({ shapes }) => {
    for (const [shapeTitle, dataSource] of shapes)
      for (const keepMode of keepDuplicateModes)
        bench(`${shapeTitle} — ${keepMode} mode`, () => {
          findDuplicateRows(dataSource, keepMode);
        });
  });
});
