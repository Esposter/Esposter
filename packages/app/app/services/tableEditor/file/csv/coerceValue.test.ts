import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { coerceValue } from "@/services/tableEditor/file/csv/coerceValue";
import { describe, expect, test } from "vitest";

describe(coerceValue, () => {
  test("empty string returns null for any type", () => {
    expect.hasAssertions();

    expect(coerceValue("", ColumnType.Boolean)).toBeNull();
    expect(coerceValue("", ColumnType.Number)).toBeNull();
    expect(coerceValue("", ColumnType.Date)).toBeNull();
    expect(coerceValue("", ColumnType.String)).toBeNull();
  });

  test("whitespace-only string returns null for any type", () => {
    expect.hasAssertions();

    expect(coerceValue("   ", ColumnType.Boolean)).toBeNull();
    expect(coerceValue("   ", ColumnType.Number)).toBeNull();
    expect(coerceValue("   ", ColumnType.Date)).toBeNull();
    expect(coerceValue("   ", ColumnType.String)).toBeNull();
  });

  test("'true' coerces to boolean true", () => {
    expect.hasAssertions();

    expect(coerceValue("true", ColumnType.Boolean)).toBe(true);
  });

  test("'false' coerces to boolean false", () => {
    expect.hasAssertions();

    expect(coerceValue("false", ColumnType.Boolean)).toBe(false);
  });

  test("boolean coercion is case insensitive", () => {
    expect.hasAssertions();

    expect(coerceValue("TRUE", ColumnType.Boolean)).toBe(true);
    expect(coerceValue("FALSE", ColumnType.Boolean)).toBe(false);
    expect(coerceValue("True", ColumnType.Boolean)).toBe(true);
    expect(coerceValue("False", ColumnType.Boolean)).toBe(false);
  });

  test("integer string coerces to number", () => {
    expect.hasAssertions();

    expect(coerceValue("42", ColumnType.Number)).toBe(42);
  });

  test("decimal string coerces to number", () => {
    expect.hasAssertions();

    expect(coerceValue("3.14", ColumnType.Number)).toBe(3.14);
  });

  test("negative number string coerces to number", () => {
    expect.hasAssertions();

    expect(coerceValue("-5", ColumnType.Number)).toBe(-5);
  });

  test("invalid number string returns null", () => {
    expect.hasAssertions();

    expect(coerceValue("not-a-number", ColumnType.Number)).toBeNull();
  });

  test("date string stays as string", () => {
    expect.hasAssertions();

    expect(coerceValue("2023-01-01", ColumnType.Date)).toBe("2023-01-01");
  });

  test("plain string stays as string", () => {
    expect.hasAssertions();

    expect(coerceValue("hello", ColumnType.String)).toBe("hello");
  });

  test("whitespace is trimmed before coercion", () => {
    expect.hasAssertions();

    expect(coerceValue("  42  ", ColumnType.Number)).toBe(42);
    expect(coerceValue("  true  ", ColumnType.Boolean)).toBe(true);
    expect(coerceValue("  false  ", ColumnType.Boolean)).toBe(false);
  });
});
