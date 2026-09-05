import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { DateFormats } from "#shared/models/resource/sheet/column/DateFormat";
import { formatDate } from "#shared/util/date/formatDate";
import { BooleanValue } from "@/models/resource/sheet/column/BooleanValue";
import { inferColumnType } from "@/services/resource/sheet/column/inferColumnType";
import { describe, expect, test } from "vitest";

describe(inferColumnType, () => {
  const EPOCH_DATE = new Date(1970, 0, 1);

  test(`empty array returns ${ColumnType.String}`, () => {
    expect.hasAssertions();

    expect(inferColumnType([])).toBe(ColumnType.String);
  });

  test(`boolean returns ${ColumnType.Boolean}`, () => {
    expect.hasAssertions();

    expect(inferColumnType([BooleanValue.True, BooleanValue.False])).toBe(ColumnType.Boolean);
  });

  test(`${ColumnType.Boolean} is case insensitive`, () => {
    expect.hasAssertions();

    expect(inferColumnType(["TRUE", "FALSE"])).toBe(ColumnType.Boolean);
  });

  test(`integer, decimal and negative return ${ColumnType.Number}`, () => {
    expect.hasAssertions();

    expect(inferColumnType(["0"])).toBe(ColumnType.Number);
    expect(inferColumnType(["0.1"])).toBe(ColumnType.Number);
    expect(inferColumnType(["-1"])).toBe(ColumnType.Number);
  });

  test(`NaN returns ${ColumnType.String}`, () => {
    expect.hasAssertions();

    expect(inferColumnType([String(Number.NaN)])).toBe(ColumnType.String);
  });

  test.each(DateFormats)(`reads a %s date as ${ColumnType.Date}`, (format) => {
    expect.hasAssertions();

    expect(inferColumnType([formatDate(EPOCH_DATE, format)])).toBe(ColumnType.Date);
  });

  test(`mixed values return ${ColumnType.String}`, () => {
    expect.hasAssertions();

    expect(inferColumnType(["true", "0"])).toBe(ColumnType.String);
    expect(inferColumnType(["0", "1970-01-01"])).toBe(ColumnType.String);
    expect(inferColumnType(["true", "1970-01-01"])).toBe(ColumnType.String);
  });
});
