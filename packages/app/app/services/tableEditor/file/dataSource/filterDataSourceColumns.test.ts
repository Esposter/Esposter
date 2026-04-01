// @vitest-environment node
import {
  makeComputedColumn,
  makeDataSource,
  makeNumberColumn,
  makeRow,
} from "@/composables/tableEditor/file/commands/testUtils.test";
import { filterDataSourceColumns } from "@/services/tableEditor/file/dataSource/filterDataSourceColumns";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(filterDataSourceColumns, () => {
  test(`computed column value is included in filtered rows`, () => {
    expect.hasAssertions();

    const sourceColumn = makeNumberColumn("price");
    const computedColumn = makeComputedColumn("priceStr", sourceColumn.id);
    const dataSource = makeDataSource([sourceColumn, computedColumn], [makeRow({ price: 42 })]);

    const { rows } = filterDataSourceColumns(dataSource.columns, dataSource.rows, [sourceColumn.id, computedColumn.id]);

    expect(takeOne(rows).data).toStrictEqual({ price: 42, priceStr: "42" });
  });

  test(`non-exported columns are excluded from rows`, () => {
    expect.hasAssertions();

    const colA = makeNumberColumn("a");
    const colB = makeNumberColumn("b");
    const dataSource = makeDataSource([colA, colB], [makeRow({ a: 1, b: 2 })]);

    const { columns, rows } = filterDataSourceColumns(dataSource.columns, dataSource.rows, [colA.id]);

    expect(columns).toHaveLength(1);
    expect(takeOne(columns).id).toBe(colA.id);
    expect(takeOne(rows).data).toStrictEqual({ a: 1 });
  });
});
