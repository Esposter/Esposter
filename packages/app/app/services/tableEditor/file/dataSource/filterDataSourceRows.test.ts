import { BooleanColumn } from "#shared/models/tableEditor/file/column/BooleanColumn";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import {
  makeColumn,
  makeDataSource,
  makeNumberColumn,
  makeRow,
} from "@/composables/tableEditor/file/commands/testUtils.test";
import { isActiveColumnFilter } from "@/services/tableEditor/file/column/isActiveColumnFilter";
import { filterDataSourceRows } from "@/services/tableEditor/file/dataSource/filterDataSourceRows";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(filterDataSourceRows, () => {
  test("empty filters returns the same dataSource reference", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("")], [makeRow({ "": "" }), makeRow({ "": " " })]);

    expect(filterDataSourceRows(dataSource, {})).toBe(dataSource);
  });

  test("all-inactive filters returns the same dataSource reference", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("")], [makeRow({ "": "" })]);

    expect(filterDataSourceRows(dataSource, { "": { type: ColumnType.String, value: "" } })).toBe(dataSource);
  });

  test("string filter keeps rows whose cell value contains the filter string", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource(
      [makeColumn("")],
      [makeRow({ "": "abc" }), makeRow({ "": "def" }), makeRow({ "": "abcdef" })],
    );

    const result = filterDataSourceRows(dataSource, { "": { type: ColumnType.String, value: "abc" } });

    expect(result.rows).toHaveLength(2);
    expect(takeOne(takeOne(result.rows, 0).data, "")).toBe("abc");
    expect(takeOne(takeOne(result.rows, 1).data, "")).toBe("abcdef");
  });

  test("string filter is case-insensitive", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("")], [makeRow({ "": "ABC" }), makeRow({ "": "xyz" })]);

    const result = filterDataSourceRows(dataSource, { "": { type: ColumnType.String, value: "abc" } });

    expect(result.rows).toHaveLength(1);
    expect(takeOne(takeOne(result.rows, 0).data, "")).toBe("ABC");
  });

  test("string filter excludes null cell values", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("")], [makeRow({ "": null }), makeRow({ "": "abc" })]);

    const result = filterDataSourceRows(dataSource, { "": { type: ColumnType.String, value: "abc" } });

    expect(result.rows).toHaveLength(1);
  });

  test("multiple column filters must all match", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource(
      [makeColumn(""), makeColumn(" ")],
      [makeRow({ "": "abc", " ": "xyz" }), makeRow({ "": "abc", " ": "def" }), makeRow({ "": "ghi", " ": "xyz" })],
    );

    const result = filterDataSourceRows(dataSource, {
      "": { type: ColumnType.String, value: "abc" },
      " ": { type: ColumnType.String, value: "xyz" },
    });

    expect(result.rows).toHaveLength(1);
    expect(takeOne(takeOne(result.rows, 0).data, "")).toBe("abc");
  });

  test("string filter with no matches returns empty rows", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeColumn("")], [makeRow({ "": "abc" }), makeRow({ "": "def" })]);

    const result = filterDataSourceRows(dataSource, { "": { type: ColumnType.String, value: "zzz" } });

    expect(result.rows).toHaveLength(0);
  });

  test("boolean filter true keeps only true rows", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource(
      [new BooleanColumn({ name: "" })],
      [makeRow({ "": true }), makeRow({ "": false }), makeRow({ "": null })],
    );

    const result = filterDataSourceRows(dataSource, { "": { type: ColumnType.Boolean, value: "true" } });

    expect(result.rows).toHaveLength(1);
    expect(takeOne(takeOne(result.rows, 0).data, "")).toBe(true);
  });

  test("boolean filter false keeps only false rows", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource(
      [new BooleanColumn({ name: "" })],
      [makeRow({ "": true }), makeRow({ "": false }), makeRow({ "": null })],
    );

    const result = filterDataSourceRows(dataSource, { "": { type: ColumnType.Boolean, value: "false" } });

    expect(result.rows).toHaveLength(1);
    expect(takeOne(takeOne(result.rows, 0).data, "")).toBe(false);
  });

  test("boolean filter null keeps only null rows", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource(
      [new BooleanColumn({ name: "" })],
      [makeRow({ "": true }), makeRow({ "": false }), makeRow({ "": null })],
    );

    const result = filterDataSourceRows(dataSource, { "": { type: ColumnType.Boolean, value: "null" } });

    expect(result.rows).toHaveLength(1);
    expect(takeOne(takeOne(result.rows, 0).data, "")).toBeNull();
  });

  test("boolean filter empty string keeps all rows", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource(
      [new BooleanColumn({ name: "" })],
      [makeRow({ "": true }), makeRow({ "": false }), makeRow({ "": null })],
    );

    expect(filterDataSourceRows(dataSource, { "": { type: ColumnType.Boolean, value: "" } })).toBe(dataSource);
  });

  test("number filter minimum keeps rows at or above the threshold", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource(
      [makeNumberColumn("")],
      [makeRow({ "": 0 }), makeRow({ "": 1 }), makeRow({ "": 2 })],
    );

    const result = filterDataSourceRows(dataSource, { "": { maximum: "", minimum: "1", type: ColumnType.Number } });

    expect(result.rows).toHaveLength(2);
    expect(takeOne(takeOne(result.rows, 0).data, "")).toBe(1);
    expect(takeOne(takeOne(result.rows, 1).data, "")).toBe(2);
  });

  test("number filter maximum keeps rows at or below the threshold", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource(
      [makeNumberColumn("")],
      [makeRow({ "": 0 }), makeRow({ "": 1 }), makeRow({ "": 2 })],
    );

    const result = filterDataSourceRows(dataSource, { "": { maximum: "1", minimum: "", type: ColumnType.Number } });

    expect(result.rows).toHaveLength(2);
    expect(takeOne(takeOne(result.rows, 0).data, "")).toBe(0);
    expect(takeOne(takeOne(result.rows, 1).data, "")).toBe(1);
  });

  test("number filter range keeps rows within min and max inclusive", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource(
      [makeNumberColumn("")],
      [makeRow({ "": 0 }), makeRow({ "": 1 }), makeRow({ "": 2 })],
    );

    const result = filterDataSourceRows(dataSource, { "": { maximum: "1", minimum: "1", type: ColumnType.Number } });

    expect(result.rows).toHaveLength(1);
    expect(takeOne(takeOne(result.rows, 0).data, "")).toBe(1);
  });

  test("number filter excludes null cell values", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource([makeNumberColumn("")], [makeRow({ "": null }), makeRow({ "": 1 })]);

    const result = filterDataSourceRows(dataSource, { "": { maximum: "", minimum: "0", type: ColumnType.Number } });

    expect(result.rows).toHaveLength(1);
  });

  test("number filter excludes NaN cell values", () => {
    expect.hasAssertions();

    const dataSource = makeDataSource(
      [makeNumberColumn("")],
      [makeRow({ "": String(Number.NaN) }), makeRow({ "": 1 })],
    );

    const result = filterDataSourceRows(dataSource, { "": { maximum: "", minimum: "0", type: ColumnType.Number } });

    expect(result.rows).toHaveLength(1);
  });

  test("columns are preserved unchanged in result", () => {
    expect.hasAssertions();

    const columns = [makeColumn(""), makeColumn(" ")];
    const dataSource = makeDataSource(columns, [makeRow({ "": "abc", " ": "" })]);

    const result = filterDataSourceRows(dataSource, { "": { type: ColumnType.String, value: "abc" } });

    expect(result.columns).toBe(columns);
  });
});

describe(isActiveColumnFilter, () => {
  test("string filter with non-empty value is active", () => {
    expect.hasAssertions();
    expect(isActiveColumnFilter({ type: ColumnType.String, value: "abc" })).toBe(true);
  });

  test("string filter with empty value is inactive", () => {
    expect.hasAssertions();
    expect(isActiveColumnFilter({ type: ColumnType.String, value: "" })).toBe(false);
  });

  test("boolean filter with non-empty value is active", () => {
    expect.hasAssertions();
    expect(isActiveColumnFilter({ type: ColumnType.Boolean, value: "true" })).toBe(true);
  });

  test("boolean filter with empty value is inactive", () => {
    expect.hasAssertions();
    expect(isActiveColumnFilter({ type: ColumnType.Boolean, value: "" })).toBe(false);
  });

  test("number filter with minimum is active", () => {
    expect.hasAssertions();
    expect(isActiveColumnFilter({ maximum: "", minimum: "0", type: ColumnType.Number })).toBe(true);
  });

  test("number filter with maximum is active", () => {
    expect.hasAssertions();
    expect(isActiveColumnFilter({ maximum: "10", minimum: "", type: ColumnType.Number })).toBe(true);
  });

  test("number filter with both empty is inactive", () => {
    expect.hasAssertions();
    expect(isActiveColumnFilter({ maximum: "", minimum: "", type: ColumnType.Number })).toBe(false);
  });
});
