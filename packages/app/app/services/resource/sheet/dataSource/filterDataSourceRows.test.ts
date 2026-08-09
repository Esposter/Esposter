import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { createBooleanColumn } from "@/composables/resource/sheet/commands/createBooleanColumn.test";
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createNumberColumn } from "@/composables/resource/sheet/commands/createNumberColumn.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { BooleanValue } from "@/models/resource/sheet/column/BooleanValue";
import { NULL_BOOLEAN_FILTER_VALUE } from "@/services/resource/sheet/constants";
import { filterDataSourceRows } from "@/services/resource/sheet/dataSource/filterDataSourceRows";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(filterDataSourceRows, () => {
  const booleanDataSource = createDataSource(
    [createBooleanColumn("")],
    [createRow({ "": true }), createRow({ "": false }), createRow({ "": null })],
  );
  const numberDataSource = createDataSource(
    [createNumberColumn("")],
    [createRow({ "": 0 }), createRow({ "": 1 }), createRow({ "": 2 })],
  );

  test("empty filters returns the same rows reference", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("")], [createRow({ "": "" }), createRow({ "": " " })]);

    expect(filterDataSourceRows(dataSource.rows, {})).toBe(dataSource.rows);
  });

  test("all-inactive filters returns the same rows reference", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("")], [createRow({ "": "" })]);

    expect(filterDataSourceRows(dataSource.rows, { "": { type: ColumnType.String, value: "" } })).toBe(dataSource.rows);
  });

  test("string filter keeps rows whose cell value contains the filter string", () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [createColumn("")],
      [createRow({ "": "abc" }), createRow({ "": "def" }), createRow({ "": "abcdef" })],
    );

    const result = filterDataSourceRows(dataSource.rows, { "": { type: ColumnType.String, value: "abc" } });

    expect(result).toHaveLength(2);
    expect(takeOne(takeOne(result).data, "")).toBe("abc");
    expect(takeOne(takeOne(result, 1).data, "")).toBe("abcdef");
  });

  test("string filter is case-insensitive", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("")], [createRow({ "": "ABC" }), createRow({ "": "xyz" })]);

    const result = filterDataSourceRows(dataSource.rows, { "": { type: ColumnType.String, value: "abc" } });

    expect(result).toHaveLength(1);
    expect(takeOne(takeOne(result).data, "")).toBe("ABC");
  });

  test("string filter excludes null cell values", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("")], [createRow({ "": null }), createRow({ "": "abc" })]);

    const result = filterDataSourceRows(dataSource.rows, { "": { type: ColumnType.String, value: "abc" } });

    expect(result).toHaveLength(1);
  });

  test("multiple column filters must all match", () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [createColumn(""), createColumn(" ")],
      [
        createRow({ "": "abc", " ": "xyz" }),
        createRow({ "": "abc", " ": "def" }),
        createRow({ "": "ghi", " ": "xyz" }),
      ],
    );

    const result = filterDataSourceRows(dataSource.rows, {
      "": { type: ColumnType.String, value: "abc" },
      " ": { type: ColumnType.String, value: "xyz" },
    });

    expect(result).toHaveLength(1);
    expect(takeOne(takeOne(result).data, "")).toBe("abc");
  });

  test("string filter with no matches returns empty rows", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createColumn("")], [createRow({ "": "abc" }), createRow({ "": "def" })]);

    const result = filterDataSourceRows(dataSource.rows, { "": { type: ColumnType.String, value: "zzz" } });

    expect(result).toHaveLength(0);
  });

  test("boolean filter true keeps only true rows", () => {
    expect.hasAssertions();

    const result = filterDataSourceRows(booleanDataSource.rows, {
      "": { type: ColumnType.Boolean, value: BooleanValue.True },
    });

    expect(result).toHaveLength(1);
    expect(takeOne(takeOne(result).data, "")).toBe(true);
  });

  test("boolean filter false keeps only false rows", () => {
    expect.hasAssertions();

    const result = filterDataSourceRows(booleanDataSource.rows, {
      "": { type: ColumnType.Boolean, value: BooleanValue.False },
    });

    expect(result).toHaveLength(1);
    expect(takeOne(takeOne(result).data, "")).toBe(false);
  });

  test("boolean filter null keeps only null rows", () => {
    expect.hasAssertions();

    const result = filterDataSourceRows(booleanDataSource.rows, {
      "": { type: ColumnType.Boolean, value: NULL_BOOLEAN_FILTER_VALUE },
    });

    expect(result).toHaveLength(1);
    expect(takeOne(takeOne(result).data, "")).toBeNull();
  });

  test("number filter minimum keeps rows at or above the threshold", () => {
    expect.hasAssertions();

    const result = filterDataSourceRows(numberDataSource.rows, {
      "": { maximum: "", minimum: "1", type: ColumnType.Number },
    });

    expect(result).toHaveLength(2);
    expect(takeOne(takeOne(result).data, "")).toBe(1);
    expect(takeOne(takeOne(result, 1).data, "")).toBe(2);
  });

  test("number filter maximum keeps rows at or below the threshold", () => {
    expect.hasAssertions();

    const result = filterDataSourceRows(numberDataSource.rows, {
      "": { maximum: "1", minimum: "", type: ColumnType.Number },
    });

    expect(result).toHaveLength(2);
    expect(takeOne(takeOne(result).data, "")).toBe(0);
    expect(takeOne(takeOne(result, 1).data, "")).toBe(1);
  });

  test("number filter range keeps rows within min and max inclusive", () => {
    expect.hasAssertions();

    const result = filterDataSourceRows(numberDataSource.rows, {
      "": { maximum: "1", minimum: "1", type: ColumnType.Number },
    });

    expect(result).toHaveLength(1);
    expect(takeOne(takeOne(result).data, "")).toBe(1);
  });

  test("number filter excludes null cell values", () => {
    expect.hasAssertions();

    const dataSource = createDataSource([createNumberColumn("")], [createRow({ "": null }), createRow({ "": 1 })]);

    const result = filterDataSourceRows(dataSource.rows, {
      "": { maximum: "", minimum: "0", type: ColumnType.Number },
    });

    expect(result).toHaveLength(1);
  });

  test("number filter excludes NaN cell values", () => {
    expect.hasAssertions();

    const dataSource = createDataSource(
      [createNumberColumn("")],
      [createRow({ "": String(Number.NaN) }), createRow({ "": 1 })],
    );

    const result = filterDataSourceRows(dataSource.rows, {
      "": { maximum: "", minimum: "0", type: ColumnType.Number },
    });

    expect(result).toHaveLength(1);
  });
});
