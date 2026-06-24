import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ComputedColumn } from "#shared/models/tableEditor/file/column/ComputedColumn";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { createColumn } from "@/composables/tableEditor/file/commands/createColumn.test";
import { createComputedColumn } from "@/composables/tableEditor/file/commands/createComputedColumn.test";
import { createDataSource } from "@/composables/tableEditor/file/commands/createDataSource.test";
import { createRow } from "@/composables/tableEditor/file/commands/createRow.test";
import { computeValue } from "@/services/tableEditor/file/column/computeValue";
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

    const columnA = createComputedColumn("a", "");
    const columnB = createComputedColumn("b", columnA.id);
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
    const row = createRow({});
    const dataSource = createDataSource([columnAWithCycle, columnB], [row]);

    expect(computeValue(dataSource.rows, row, dataSource.columns, columnAWithCycle)).toBeNull();
  });
});
