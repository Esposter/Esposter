import { createColumn } from "#shared/models/resource/sheet/column/createColumn.test";
import { createComputedColumn } from "#shared/models/resource/sheet/column/createComputedColumn.test";
import { createDataSource } from "#shared/models/resource/sheet/datasource/createDataSource.test";
import { createRow } from "#shared/models/resource/sheet/datasource/createRow.test";
import { getNullAffectedRows } from "@/services/resource/sheet/commands/getNullAffectedRows";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getNullAffectedRows, () => {
  // A computed column stores nothing, so a null under its name is no empty cell — only an older row carries one
  test("ignores a computed column", () => {
    expect.hasAssertions();

    const column = createColumn("");
    const dataSource = createDataSource(
      [column, createComputedColumn(" ", column.id)],
      [createRow({ "": "0", " ": null })],
    );

    expect(getNullAffectedRows(dataSource)).toStrictEqual([]);
  });

  test("returns rows in ascending index order for non-contiguous null rows", () => {
    expect.hasAssertions();

    const rows = [createRow({ "": null }), createRow({ "": "0" }), createRow({ "": null })];
    const dataSource = createDataSource([createColumn("")], rows);

    expect(getNullAffectedRows(dataSource)).toStrictEqual([
      { index: 0, row: takeOne(rows) },
      { index: 2, row: takeOne(rows, 2) },
    ]);
  });
});
