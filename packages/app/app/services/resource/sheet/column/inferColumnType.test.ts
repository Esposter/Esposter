import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { DateFormat, DateFormats } from "#shared/models/resource/sheet/column/DateFormat";
import { dayjs } from "#shared/services/dayjs";
import { BooleanValue } from "@/models/resource/sheet/column/BooleanValue";
import { inferColumnType } from "@/services/resource/sheet/column/inferColumnType";
import { describe, expect, test } from "vitest";

describe(inferColumnType, () => {
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

  test(`all date formats epoch date returns ${ColumnType.Date}`, () => {
    expect.hasAssertions();

    for (const format of DateFormats) {
      const epochDate = dayjs("1970-01-01", DateFormat["YYYY-MM-DD"], true).format(format);

      expect(inferColumnType([epochDate])).toBe(ColumnType.Date);
    }
  });

  test(`mixed values return ${ColumnType.String}`, () => {
    expect.hasAssertions();

    expect(inferColumnType(["true", "0"])).toBe(ColumnType.String);
    expect(inferColumnType(["0", "1970-01-01"])).toBe(ColumnType.String);
    expect(inferColumnType(["true", "1970-01-01"])).toBe(ColumnType.String);
  });
});
