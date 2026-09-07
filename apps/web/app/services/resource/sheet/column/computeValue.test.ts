import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { ComputedColumn } from "#shared/models/resource/sheet/column/ComputedColumn";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createComputedColumn } from "@/composables/resource/sheet/commands/createComputedColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { computeValue } from "@/services/resource/sheet/column/computeValue";
import { describe, expect, test } from "vitest";

describe(computeValue, () => {
  test("returns row.data value for non-computed column", () => {
    expect.hasAssertions();

    const column = createColumn("");
    const row = createRow({ "": 0 });
    const dataSource = createDataSource([column], [row]);

    expect(computeValue(dataSource.rows, row, dataSource.columns, column)).toBe(0);
  });

  test("returns null for computed column when source column is not found", () => {
    expect.hasAssertions();

    const computedColumn = createComputedColumn("", "-1");
    const row = createRow({});
    const dataSource = createDataSource([computedColumn], [row]);

    expect(computeValue(dataSource.rows, row, dataSource.columns, computedColumn)).toBeNull();
  });

  test("returns null for computed column when source column is itself computed", () => {
    expect.hasAssertions();

    const sourceColumn = createComputedColumn("source", "-1");
    const computedColumn = createComputedColumn("computed", sourceColumn.id);
    const row = createRow({});
    const dataSource = createDataSource([sourceColumn, computedColumn], [row]);

    expect(computeValue(dataSource.rows, row, dataSource.columns, computedColumn)).toBeNull();
  });

  test("returns null when two computed columns form a cycle", () => {
    expect.hasAssertions();

    const firstColumn = createComputedColumn("a", "");
    const secondColumn = createComputedColumn("b", firstColumn.id);
    const firstColumnWithCycle = new ComputedColumn({
      id: firstColumn.id,
      name: "a",
      size: 0,
      sourceName: "a",
      transformation: {
        sourceColumnId: secondColumn.id,
        targetType: ColumnType.String,
        type: ColumnTransformationType.ConvertTo,
      },
    });
    const row = createRow({});
    const dataSource = createDataSource([firstColumnWithCycle, secondColumn], [row]);

    expect(computeValue(dataSource.rows, row, dataSource.columns, firstColumnWithCycle)).toBeNull();
  });
});
