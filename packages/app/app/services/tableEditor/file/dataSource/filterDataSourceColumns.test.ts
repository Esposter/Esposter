import { createComputedColumn } from "@/composables/tableEditor/file/commands/createComputedColumn.test";
import { createDataSource } from "@/composables/tableEditor/file/commands/createDataSource.test";
import { createNumberColumn } from "@/composables/tableEditor/file/commands/createNumberColumn.test";
import { createRow } from "@/composables/tableEditor/file/commands/createRow.test";
import { filterDataSourceColumns } from "@/services/tableEditor/file/dataSource/filterDataSourceColumns";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(filterDataSourceColumns, () => {
  test(`computed column value is included in filtered rows`, () => {
    expect.hasAssertions();

    const sourceColumn = createNumberColumn("price");
    const computedColumn = createComputedColumn("priceStr", sourceColumn.id);
    const dataSource = createDataSource([sourceColumn, computedColumn], [createRow({ price: 42 })]);

    const { rows } = filterDataSourceColumns(dataSource.columns, dataSource.rows, [sourceColumn.id, computedColumn.id]);

    expect(takeOne(rows).data).toStrictEqual({ price: 42, priceStr: "42" });
  });

  test(`non-exported columns are excluded from rows`, () => {
    expect.hasAssertions();

    const colA = createNumberColumn("a");
    const colB = createNumberColumn("b");
    const dataSource = createDataSource([colA, colB], [createRow({ a: 1, b: 2 })]);

    const { columns, rows } = filterDataSourceColumns(dataSource.columns, dataSource.rows, [colA.id]);

    expect(columns).toHaveLength(1);
    expect(takeOne(columns).id).toBe(colA.id);
    expect(takeOne(rows).data).toStrictEqual({ a: 1 });
  });
});
