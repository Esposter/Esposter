import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { DATE_FORMATS } from "#shared/models/tableEditor/file/constants";
import { dayjs } from "#shared/services/dayjs";
import { coerceValue } from "@/services/tableEditor/file/coerceValue";
import { describe, expect, test } from "vitest";

describe(coerceValue, () => {
  test(`empty string returns null for ${ColumnType.Boolean}`, () => {
    expect.hasAssertions();

    expect(coerceValue("", ColumnType.Boolean)).toBeNull();
  });

  test(`empty string returns null for ${ColumnType.Number}`, () => {
    expect.hasAssertions();

    expect(coerceValue("", ColumnType.Number)).toBeNull();
  });

  test(`empty string returns null for ${ColumnType.Date}`, () => {
    expect.hasAssertions();

    expect(coerceValue("", ColumnType.Date)).toBeNull();
  });

  test(`empty string returns null for ${ColumnType.String}`, () => {
    expect.hasAssertions();

    expect(coerceValue("", ColumnType.String)).toBeNull();
  });

  test("whitespace-only string returns null for any type", () => {
    expect.hasAssertions();

    expect(coerceValue("   ", ColumnType.Boolean)).toBeNull();
    expect(coerceValue("   ", ColumnType.Number)).toBeNull();
    expect(coerceValue("   ", ColumnType.Date)).toBeNull();
    expect(coerceValue("   ", ColumnType.String)).toBeNull();
  });

  test(`"true" coerces to ${ColumnType.Boolean} true`, () => {
    expect.hasAssertions();

    expect(coerceValue("true", ColumnType.Boolean)).toBe(true);
  });

  test(`"false" coerces to ${ColumnType.Boolean} false`, () => {
    expect.hasAssertions();

    expect(coerceValue("false", ColumnType.Boolean)).toBe(false);
  });

  test(`${ColumnType.Boolean} coercion is case insensitive`, () => {
    expect.hasAssertions();

    expect(coerceValue("TRUE", ColumnType.Boolean)).toBe(true);
    expect(coerceValue("FALSE", ColumnType.Boolean)).toBe(false);
    expect(coerceValue("True", ColumnType.Boolean)).toBe(true);
    expect(coerceValue("False", ColumnType.Boolean)).toBe(false);
  });

  test(`integer coerces to ${ColumnType.Number}`, () => {
    expect.hasAssertions();

    expect(coerceValue("0", ColumnType.Number)).toBe(0);
  });

  test(`decimal coerces to ${ColumnType.Number}`, () => {
    expect.hasAssertions();

    expect(coerceValue("0.1", ColumnType.Number)).toBe(0.1);
  });

  test(`negative coerces to ${ColumnType.Number}`, () => {
    expect.hasAssertions();

    expect(coerceValue("-1", ColumnType.Number)).toBe(-1);
  });

  test(`NaN returns null for ${ColumnType.Number}`, () => {
    expect.hasAssertions();

    expect(coerceValue(String(Number.NaN), ColumnType.Number)).toBeNull();
  });

  test(`epoch date stays as ${ColumnType.Date} string`, () => {
    expect.hasAssertions();

    expect(coerceValue("1970-01-01", ColumnType.Date)).toBe("1970-01-01");
  });

  test(`all date formats epoch date stays as ${ColumnType.Date} string`, () => {
    expect.hasAssertions();

    for (const format of DATE_FORMATS) {
      const epochDate = dayjs("1970-01-01", "YYYY-MM-DD", true).format(format);

      expect(coerceValue(epochDate, ColumnType.Date)).toBe(epochDate);
    }
  });

  test(`plain string stays as ${ColumnType.String}`, () => {
    expect.hasAssertions();

    expect(coerceValue("hello", ColumnType.String)).toBe("hello");
  });

  test("whitespace is trimmed before coercion", () => {
    expect.hasAssertions();

    expect(coerceValue("  0  ", ColumnType.Number)).toBe(0);
    expect(coerceValue("  true  ", ColumnType.Boolean)).toBe(true);
    expect(coerceValue("  false  ", ColumnType.Boolean)).toBe(false);
  });
});
