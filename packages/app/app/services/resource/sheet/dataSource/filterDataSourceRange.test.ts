import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createComputedColumn } from "@/composables/resource/sheet/commands/createComputedColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { filterDataSourceRange } from "@/services/resource/sheet/dataSource/filterDataSourceRange";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(filterDataSourceRange, () => {
  const sourceColumn = createColumn("source");
  const computedColumn = createComputedColumn("computed", sourceColumn.id);
  const rows = [createRow({ source: "0" }), createRow({ source: "1" }), createRow({ source: "2" })];
  const dataSource = createDataSource([sourceColumn, computedColumn], rows);

  test("materializes only the selected columns and rows", () => {
    expect.hasAssertions();

    const { columns, rows: rangeRows } = filterDataSourceRange(dataSource, dataSource.rows, {
      columnEnd: 0,
      columnStart: 0,
      rowEnd: 1,
      rowStart: 1,
    });

    expect(columns.map(({ name }) => name)).toStrictEqual(["source"]);
    expect(rangeRows).toHaveLength(1);
    expect(takeOne(rangeRows).data).toStrictEqual({ source: "1" });
  });

  test("a computed column in range carries its displayed value", () => {
    expect.hasAssertions();

    const { rows: rangeRows } = filterDataSourceRange(dataSource, dataSource.rows, {
      columnEnd: 1,
      columnStart: 1,
      rowEnd: 0,
      rowStart: 0,
    });

    expect(takeOne(rangeRows).data).toStrictEqual({ computed: "0" });
  });

  test("a computed column resolves a hidden source column the range itself never selects", () => {
    expect.hasAssertions();

    const hiddenSourceColumn = createColumn("source");
    hiddenSourceColumn.hidden = true;
    const hiddenSourceDataSource = createDataSource(
      [hiddenSourceColumn, createComputedColumn("computed", hiddenSourceColumn.id)],
      rows,
    );
    const { columns, rows: rangeRows } = filterDataSourceRange(hiddenSourceDataSource, hiddenSourceDataSource.rows, {
      columnEnd: 0,
      columnStart: 0,
      rowEnd: 0,
      rowStart: 0,
    });

    expect(columns.map(({ name }) => name)).toStrictEqual(["computed"]);
    expect(takeOne(rangeRows).data).toStrictEqual({ computed: "0" });
  });
});
