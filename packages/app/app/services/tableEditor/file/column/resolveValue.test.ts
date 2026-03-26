import { ComputedColumn } from "#shared/models/tableEditor/file/column/ComputedColumn";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
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

  test("returns null for computed column when source column is not found", () => {
    expect.hasAssertions();

    const computedColumn = makeComputedColumn("", "-1");
    const row = makeRow({});
    const dataSource = makeDataSource([computedColumn], [row]);

    expect(resolveValue(row, dataSource.columns, computedColumn)).toBeNull();
  });

  test("returns null for computed column when source column is itself computed", () => {
    expect.hasAssertions();

    const sourceColumn = makeComputedColumn("source", "-1");
    const computedColumn = makeComputedColumn("computed", sourceColumn.id);
    const row = makeRow({});
    const dataSource = makeDataSource([sourceColumn, computedColumn], [row]);

    expect(resolveValue(row, dataSource.columns, computedColumn)).toBeNull();
  });

  test("returns null when two computed columns form a cycle", () => {
    expect.hasAssertions();

    const columnA = makeComputedColumn("a", "");
    const columnB = makeComputedColumn("b", columnA.id);
    const columnAWithCycle = new ComputedColumn({
      id: columnA.id,
      name: "a",
      size: 0,
      sourceName: "a",
      transformation: {
        sourceColumnId: columnB.id,
        targetType: ColumnType.String,
        type: ColumnTransformationType.ConvertTo,
      },
    });
    const row = makeRow({});
    const dataSource = makeDataSource([columnAWithCycle, columnB], [row]);

    expect(resolveValue(row, dataSource.columns, columnAWithCycle)).toBeNull();
  });
});
