import { ColumnTransformationType, MathOperationType } from "#shared/models/tableEditor/file/ColumnTransformationType";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { ComputedColumn } from "#shared/models/tableEditor/file/ComputedColumn";
import { Row } from "#shared/models/tableEditor/file/Row";
import {
  makeColumn,
  makeComputedColumn,
  makeDataSource,
  makeRow,
} from "@/composables/tableEditor/file/commands/testUtils.test";
import { resolveValue } from "@/services/tableEditor/file/column/resolveValue";
import { describe, expect, test } from "vitest";

describe(resolveValue, () => {
  test("returns row.data value for non-computed column", () => {
    expect.hasAssertions();

    const column = makeColumn("");
    const row = makeRow({ "": 0 });
    const dataSource = makeDataSource([column], [row]);

    expect(resolveValue(row, dataSource.columns, column)).toBe(0);
  });

  test("returns null for non-computed column with missing key", () => {
    expect.hasAssertions();

    const column = makeColumn("");
    const row = new Row({ data: {} });
    const dataSource = makeDataSource([column], [row]);

    expect(resolveValue(row, dataSource.columns, column)).toBeNull();
  });

  test("evaluates transformation for computed column", () => {
    expect.hasAssertions();

    const sourceColumn = makeColumn("");
    const computedColumn = makeComputedColumn(" ", sourceColumn.id, {
      type: ColumnTransformationType.MathOperation,
      operation: MathOperationType.Multiply,
      operand: 2,
    });
    const row = makeRow({ "": 1 });
    const dataSource = makeDataSource([sourceColumn, computedColumn], [row]);

    expect(resolveValue(row, dataSource.columns, computedColumn)).toBe(2);
  });

  test("returns null for computed column when source column is not found", () => {
    expect.hasAssertions();

    const computedColumn = makeComputedColumn("", "-1");
    const row = makeRow({});
    const dataSource = makeDataSource([computedColumn], [row]);

    expect(resolveValue(row, dataSource.columns, computedColumn)).toBeNull();
  });

  test("returns null for computed column when source value is null", () => {
    expect.hasAssertions();

    const sourceColumn = makeColumn("");
    const computedColumn = makeComputedColumn(" ", sourceColumn.id, {
      type: ColumnTransformationType.MathOperation,
      operation: MathOperationType.Multiply,
      operand: 2,
    });
    const row = makeRow({ "": null });
    const dataSource = makeDataSource([sourceColumn, computedColumn], [row]);

    expect(resolveValue(row, dataSource.columns, computedColumn)).toBeNull();
  });

  test("computed column with ConvertTo transformation converts source value", () => {
    expect.hasAssertions();

    const sourceColumn = makeColumn("");
    const computedColumn = makeComputedColumn(" ", sourceColumn.id, {
      type: ColumnTransformationType.ConvertTo,
      targetType: ColumnType.Number,
    });
    const row = makeRow({ "": "0.1" });
    const dataSource = makeDataSource([sourceColumn, computedColumn], [row]);

    expect(resolveValue(row, dataSource.columns, computedColumn)).toBeCloseTo(0.1);
  });
});
