import { NumberFormat } from "#shared/models/resource/sheet/column/NumberFormat";
import { createComputedColumn } from "@/composables/resource/sheet/commands/createComputedColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createNumberColumn } from "@/composables/resource/sheet/commands/createNumberColumn.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { findMatchingCells } from "@/services/resource/sheet/commands/findMatchingCells";
import { describe, expect, test } from "vitest";

describe(findMatchingCells, () => {
  const amount = "amount";
  // Closes over `amount`, so it lives beside it rather than at module scope
  const createFormattedDataSource = () => {
    const column = createNumberColumn(amount);
    column.format = NumberFormat.Currency;
    return createDataSource([column], [createRow({ [amount]: 1234 })]);
  };

  // Find and replace is the one search that does not go through the column's format, and deliberately so: a
  // Replacement writes back into the cell, and a match made against `$1,234.00` has no coherent value to write
  // For the separators and the symbol the reader typed. Global search is the one that follows the format —
  // Its own case lives in Row/Table.test.ts, so this pins the pair being different on purpose
  // A computed cell stores nothing, and an absent value stringifies to "undefined" — so a find walking `row.data`
  // Matched every letter of that word in every computed column, and a replace then wrote into it
  test("matches nothing in a computed column", () => {
    expect.hasAssertions();

    const column = createNumberColumn(amount);
    const dataSource = createDataSource([column, createComputedColumn(" ", column.id)], [createRow({ [amount]: 0 })]);

    expect(findMatchingCells(dataSource, "u")).toStrictEqual([]);
  });

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
