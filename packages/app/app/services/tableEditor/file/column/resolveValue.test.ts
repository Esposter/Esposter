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
});
