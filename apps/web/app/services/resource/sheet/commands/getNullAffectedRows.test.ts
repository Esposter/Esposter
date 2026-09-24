import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { getNullAffectedRows } from "@/services/resource/sheet/commands/getNullAffectedRows";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getNullAffectedRows, () => {
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
