import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { DateFormats } from "#shared/models/resource/sheet/column/DateFormat";
import { formatDate } from "#shared/util/date/formatDate";
import { BooleanValue } from "@/models/resource/sheet/column/BooleanValue";
import { coerceValue } from "@/services/resource/sheet/column/coerceValue";
import { describe, expect, test } from "vitest";

describe(coerceValue, () => {
  const EPOCH_DATE = new Date(1970, 0, 1);

  test("empty and whitespace-only strings return null", () => {
    expect.hasAssertions();

    expect(coerceValue("", ColumnType.String)).toBeNull();
    expect(coerceValue(" ", ColumnType.String)).toBeNull();
  });

  test(`"true" coerces to ${ColumnType.Boolean} true`, () => {
    expect.hasAssertions();

    expect(coerceValue(BooleanValue.True, ColumnType.Boolean)).toBe(true);
  });

  test(`"false" coerces to ${ColumnType.Boolean} false`, () => {
    expect.hasAssertions();

    expect(coerceValue(BooleanValue.False, ColumnType.Boolean)).toBe(false);
  });

  test(`${ColumnType.Boolean} coercion is case insensitive`, () => {
    expect.hasAssertions();

    expect(coerceValue("TRUE", ColumnType.Boolean)).toBe(true);
    expect(coerceValue("FALSE", ColumnType.Boolean)).toBe(false);
    expect(coerceValue("True", ColumnType.Boolean)).toBe(true);
    expect(coerceValue("False", ColumnType.Boolean)).toBe(false);
  });

  test(`integer, decimal and negative coerce to ${ColumnType.Number}`, () => {
    expect.hasAssertions();

    expect(coerceValue("0", ColumnType.Number)).toBe(0);
    expect(coerceValue("0.1", ColumnType.Number)).toBe(0.1);
    expect(coerceValue("-1", ColumnType.Number)).toBe(-1);
  });

  test(`NaN returns null for ${ColumnType.Number}`, () => {
    expect.hasAssertions();

    expect(coerceValue(String(Number.NaN), ColumnType.Number)).toBeNull();
  });

  test.each(DateFormats)(`keeps a %s date as the ${ColumnType.Date} string it was written in`, (format) => {
    expect.hasAssertions();

    const epochDate = formatDate(EPOCH_DATE, format);

    expect(coerceValue(epochDate, ColumnType.Date)).toBe(epochDate);
  });

  test(`plain string stays as ${ColumnType.String}`, () => {
    expect.hasAssertions();

    expect(coerceValue("a", ColumnType.String)).toBe("a");
  });

  test("whitespace is trimmed before coercion", () => {
    expect.hasAssertions();

    expect(coerceValue("  0  ", ColumnType.Number)).toBe(0);
    expect(coerceValue("  true  ", ColumnType.Boolean)).toBe(true);
    expect(coerceValue("  false  ", ColumnType.Boolean)).toBe(false);
  });
});
