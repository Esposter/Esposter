import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { inferColumnType } from "@/services/tableEditor/file/inferColumnType";
import { describe, expect, test } from "vitest";

describe(inferColumnType, () => {
  test("empty array returns String", () => {
    expect.hasAssertions();

    expect(inferColumnType([])).toBe(ColumnType.String);
  });

  test("all whitespace values returns String", () => {
    expect.hasAssertions();

    expect(inferColumnType(["", "  ", "\t"])).toBe(ColumnType.String);
  });

  test("boolean values returns Boolean", () => {
    expect.hasAssertions();

    expect(inferColumnType(["true", "false"])).toBe(ColumnType.Boolean);
  });

  test("boolean values are case insensitive", () => {
    expect.hasAssertions();

    expect(inferColumnType(["TRUE", "FALSE", "True", "False"])).toBe(ColumnType.Boolean);
  });

  test("integer values returns Number", () => {
    expect.hasAssertions();

    expect(inferColumnType(["1", "2", "3"])).toBe(ColumnType.Number);
  });

  test("decimal values returns Number", () => {
    expect.hasAssertions();

    expect(inferColumnType(["1.5", "2.75", "3.0"])).toBe(ColumnType.Number);
  });

  test("negative values returns Number", () => {
    expect.hasAssertions();

    expect(inferColumnType(["-1", "-2.5", "0"])).toBe(ColumnType.Number);
  });

  test("iso date values returns Date", () => {
    expect.hasAssertions();

    expect(inferColumnType(["2023-01-01", "2024-06-15"])).toBe(ColumnType.Date);
  });

  test("slash date values returns Date", () => {
    expect.hasAssertions();

    expect(inferColumnType(["01/15/2023", "06/20/2024"])).toBe(ColumnType.Date);
  });

  test("text values returns String", () => {
    expect.hasAssertions();

    expect(inferColumnType(["hello", "world"])).toBe(ColumnType.String);
  });

  test("mixed boolean and number values returns String", () => {
    expect.hasAssertions();

    expect(inferColumnType(["true", "1"])).toBe(ColumnType.String);
  });

  test("mixed number and text values returns String", () => {
    expect.hasAssertions();

    expect(inferColumnType(["1", "hello"])).toBe(ColumnType.String);
  });

  test("mixed number and date values returns String", () => {
    expect.hasAssertions();

    expect(inferColumnType(["1", "2023-01-01"])).toBe(ColumnType.String);
  });

  test("boolean values with whitespace padding returns Boolean", () => {
    expect.hasAssertions();

    expect(inferColumnType(["  true  ", " false "])).toBe(ColumnType.Boolean);
  });

  test("number values with whitespace padding returns Number", () => {
    expect.hasAssertions();

    expect(inferColumnType(["  42  ", " 3.14 "])).toBe(ColumnType.Number);
  });
});
