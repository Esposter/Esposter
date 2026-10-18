import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { ComputedColumn } from "#shared/models/resource/sheet/column/ComputedColumn";
import { createColumn } from "#shared/models/resource/sheet/column/createColumn.test";
import { createComputedColumn } from "#shared/models/resource/sheet/column/createComputedColumn.test";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { createDataSource } from "#shared/models/resource/sheet/datasource/createDataSource.test";
import { createRow } from "#shared/models/resource/sheet/datasource/createRow.test";
import { compileSheetColumns } from "#shared/services/resource/sheet/column/compileSheetColumns";
import { describe, expect, test } from "vitest";

describe(compileSheetColumns, () => {
  test("reads a stored column's value from row.data", () => {
    expect.hasAssertions();

    const column = createColumn("");
    const row = createRow({ "": 0 });
    const dataSource = createDataSource([column], [row]);

    expect(compileSheetColumns(dataSource.columns)(dataSource.rows)(row, column, 0)).toBe(0);
  });

  test("returns null for computed column when source column is not found", () => {
    expect.hasAssertions();

    const computedColumn = createComputedColumn("", "-1");
    const row = createRow({});
    const dataSource = createDataSource([computedColumn], [row]);

    expect(compileSheetColumns(dataSource.columns)(dataSource.rows)(row, computedColumn, 0)).toBeNull();
  });

  test("returns null for computed column when source column is itself computed", () => {
    expect.hasAssertions();

    const sourceColumn = createComputedColumn("", "-1");
    const computedColumn = createComputedColumn(" ", sourceColumn.id);
    const row = createRow({});
    const dataSource = createDataSource([sourceColumn, computedColumn], [row]);

    expect(compileSheetColumns(dataSource.columns)(dataSource.rows)(row, computedColumn, 0)).toBeNull();
  });

  test("two math columns depend on each other", () => {
    expect.hasAssertions();

    const firstColumn = createComputedColumn("a", "");
    const secondColumn = new ComputedColumn({
      name: "b",
      size: 0,
      sourceName: "b",
      transformation: {
        expression: "a + 1",
        type: ColumnTransformationType.Math,
        variables: [{ name: "a", sourceColumnId: firstColumn.id }],
      },
    });
    const firstColumnWithCycle = new ComputedColumn({
      id: firstColumn.id,
      name: "a",
      size: 0,
      sourceName: "a",
      transformation: {
        expression: "b + 1",
        type: ColumnTransformationType.Math,
        variables: [{ name: "b", sourceColumnId: secondColumn.id }],
      },
    });
    const row = createRow({});
    const dataSource = createDataSource([firstColumnWithCycle, secondColumn], [row]);
    const readCell = compileSheetColumns(dataSource.columns)(dataSource.rows);

    expect([readCell(row, firstColumnWithCycle, 0), readCell(row, secondColumn, 0)]).toStrictEqual([null, null]);
  });

  test("every column on a cycle reads null, including one that reaches it through a column already finished", () => {
    expect.hasAssertions();

    const aId = crypto.randomUUID();
    const bId = crypto.randomUUID();
    const cId = crypto.randomUUID();
    const dId = crypto.randomUUID();
    const columns = [
      new ComputedColumn({
        id: aId,
        name: "a",
        size: 0,
        sourceName: "a",
        transformation: {
          expression: "b + d",
          type: ColumnTransformationType.Math,
          variables: [
            { name: "b", sourceColumnId: bId },
            { name: "d", sourceColumnId: dId },
          ],
        },
      }),
      new ComputedColumn({
        id: bId,
        name: "b",
        size: 0,
        sourceName: "b",
        transformation: {
          sourceColumnId: cId,
          targetType: ColumnType.String,
          type: ColumnTransformationType.ConvertTo,
        },
      }),
      new ComputedColumn({
        id: cId,
        name: "c",
        size: 0,
        sourceName: "c",
        transformation: {
          sourceColumnId: aId,
          targetType: ColumnType.String,
          type: ColumnTransformationType.ConvertTo,
        },
      }),
      new ComputedColumn({
        id: dId,
        name: "d",
        size: 0,
        sourceName: "d",
        transformation: {
          expression: "b + 1",
          type: ColumnTransformationType.Math,
          variables: [{ name: "b", sourceColumnId: bId }],
        },
      }),
    ];
    const row = createRow({});
    const dataSource = createDataSource(columns, [row]);
    const readCell = compileSheetColumns(dataSource.columns)(dataSource.rows);

    expect(columns.map((column) => readCell(row, column, 0))).toStrictEqual([null, null, null, null]);
  });

  test("a column reading a cyclic column reads an empty source", () => {
    expect.hasAssertions();

    const firstId = crypto.randomUUID();
    const secondId = crypto.randomUUID();
    const firstColumn = new ComputedColumn({
      id: firstId,
      name: "a",
      size: 0,
      sourceName: "a",
      transformation: {
        sourceColumnId: secondId,
        targetType: ColumnType.String,
        type: ColumnTransformationType.ConvertTo,
      },
    });
    const secondColumn = new ComputedColumn({
      id: secondId,
      name: "b",
      size: 0,
      sourceName: "b",
      transformation: {
        sourceColumnId: firstId,
        targetType: ColumnType.String,
        type: ColumnTransformationType.ConvertTo,
      },
    });
    const readingColumn = createComputedColumn("", firstId);
    const row = createRow({});
    const dataSource = createDataSource([firstColumn, secondColumn, readingColumn], [row]);

    expect(compileSheetColumns(dataSource.columns)(dataSource.rows)(row, readingColumn, 0)).toBeNull();
  });

  test("reads a computed source twice when two variables share it", () => {
    expect.hasAssertions();

    const storedColumn = createColumn("x");
    const doubledColumn = new ComputedColumn({
      name: "doubled",
      size: 0,
      sourceName: "doubled",
      transformation: {
        expression: "x * 2",
        type: ColumnTransformationType.Math,
        variables: [{ name: "x", sourceColumnId: storedColumn.id }],
      },
    });
    const sumColumn = new ComputedColumn({
      name: "sum",
      size: 0,
      sourceName: "sum",
      transformation: {
        expression: "a + b",
        type: ColumnTransformationType.Math,
        variables: [
          { name: "a", sourceColumnId: doubledColumn.id },
          { name: "b", sourceColumnId: doubledColumn.id },
        ],
      },
    });
    const row = createRow({ x: 5 });
    const dataSource = createDataSource([storedColumn, doubledColumn, sumColumn], [row]);

    expect(compileSheetColumns(dataSource.columns)(dataSource.rows)(row, sumColumn, 0)).toBe(20);
  });
});
