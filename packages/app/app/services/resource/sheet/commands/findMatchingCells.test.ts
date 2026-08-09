import { NumberFormat } from "#shared/models/resource/sheet/column/NumberFormat";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createNumberColumn } from "@/composables/resource/sheet/commands/createNumberColumn.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { findMatchingCells } from "@/services/resource/sheet/commands/findMatchingCells";
import { describe, expect, test } from "vitest";

const amount = "amount";
const createFormattedDataSource = () => {
  const column = createNumberColumn(amount);
  column.format = NumberFormat.Currency;
  return createDataSource([column], [createRow({ [amount]: 1234 })]);
};

describe(findMatchingCells, () => {
  // Find and replace is the one search that does not go through the column's format, and deliberately so: a
  // Replacement writes back into the cell, and a match made against `$1,234.00` has no coherent value to write
  // For the separators and the symbol the reader typed. Global search is the one that follows the format —
  // Its own case lives in Row/Table.test.ts, so this pins the pair being different on purpose
  test("matches the underlying value of a formatted cell", () => {
    expect.hasAssertions();

    expect(findMatchingCells(createFormattedDataSource(), "1234")).toStrictEqual([
      { columnName: amount, originalValue: 1234, rowIndex: 0 },
    ]);
  });

  test("does not match the text a formatted cell renders", () => {
    expect.hasAssertions();

    expect(findMatchingCells(createFormattedDataSource(), "1,234")).toStrictEqual([]);
  });
});
