import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { collectAffectedCells } from "@/services/resource/sheet/commands/collectAffectedCells";
import { describe, expect, test } from "vitest";

describe(collectAffectedCells, () => {
  const columns = [createColumn(""), createColumn(" ")];
  const rows = [createRow({ "": "0", " ": null }), createRow({ "": null, " ": "1" }), createRow({ "": "2", " ": "3" })];

  test("collects every cell the predicate accepts, in row then column order", () => {
    expect.hasAssertions();
    expect(collectAffectedCells(rows, columns, (value) => value === null)).toStrictEqual([
      { columnName: " ", originalValue: null, rowIndex: 0 },
      { columnName: "", originalValue: null, rowIndex: 1 },
    ]);
  });

  test("only walks the columns it is handed", () => {
    expect.hasAssertions();
    expect(collectAffectedCells(rows, [createColumn(" ")], (value) => value !== null)).toStrictEqual([
      { columnName: " ", originalValue: "1", rowIndex: 1 },
      { columnName: " ", originalValue: "3", rowIndex: 2 },
    ]);
  });

  test("bounds the walk to the inclusive row range, keeping absolute row indices", () => {
    expect.hasAssertions();
    expect(collectAffectedCells(rows, columns, (value) => value !== null, { end: 2, start: 2 })).toStrictEqual([
      { columnName: "", originalValue: "2", rowIndex: 2 },
      { columnName: " ", originalValue: "3", rowIndex: 2 },
    ]);
  });

  test("returns no cells for a row range outside the dataset", () => {
    expect.hasAssertions();
    expect(collectAffectedCells(rows, columns, () => true, { end: -1, start: -1 })).toStrictEqual([]);
  });
});
