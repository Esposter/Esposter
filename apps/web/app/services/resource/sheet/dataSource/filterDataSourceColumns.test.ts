import { createComputedColumn } from "#shared/models/resource/sheet/column/createComputedColumn.test";
import { createNumberColumn } from "#shared/models/resource/sheet/column/createNumberColumn.test";
import { createDataSource } from "#shared/models/resource/sheet/datasource/createDataSource.test";
import { createRow } from "#shared/models/resource/sheet/datasource/createRow.test";
import { filterDataSourceColumns } from "@/services/resource/sheet/dataSource/filterDataSourceColumns";
import { describe, expect, test } from "vitest";

describe(filterDataSourceColumns, () => {
  test(`computed column value is included in filtered rows`, () => {
    expect.hasAssertions();

    const sourceColumn = createNumberColumn("a");
    const computedColumn = createComputedColumn("b", sourceColumn.id);
    const dataSource = createDataSource([sourceColumn, computedColumn], [createRow({ a: 0 })]);

    const { rows } = filterDataSourceColumns(dataSource.columns, dataSource.rows, [sourceColumn.id, computedColumn.id]);

    expect(rows.map(({ data }) => data)).toStrictEqual([{ a: 0, b: "0" }]);
  });

  test(`non-exported columns are excluded from rows`, () => {
    expect.hasAssertions();

    const firstColumn = createNumberColumn("a");
    const secondColumn = createNumberColumn("b");
    const dataSource = createDataSource([firstColumn, secondColumn], [createRow({ a: 1, b: 2 })]);

    const { columns, rows } = filterDataSourceColumns(dataSource.columns, dataSource.rows, [firstColumn.id]);

    expect(columns).toStrictEqual([firstColumn]);
    expect(rows.map(({ data }) => data)).toStrictEqual([{ a: 1 }]);
  });
});
