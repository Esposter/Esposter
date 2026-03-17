import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { DATE_FORMATS } from "#shared/models/tableEditor/file/constants";
import { dayjs } from "#shared/services/dayjs";
import { inferColumnType } from "@/services/tableEditor/file/column/inferColumnType";
import { describe, expect, test } from "vitest";

describe(inferColumnType, () => {
  test(`empty array returns ${ColumnType.String}`, () => {
    expect.hasAssertions();

    expect(inferColumnType([])).toBe(ColumnType.String);
  });

  test(`empty string returns ${ColumnType.String}`, () => {
    expect.hasAssertions();

    expect(inferColumnType([""])).toBe(ColumnType.String);
  });

  test(`boolean returns ${ColumnType.Boolean}`, () => {
    expect.hasAssertions();

    expect(inferColumnType(["true", "false"])).toBe(ColumnType.Boolean);
  });

  test(`${ColumnType.Boolean} is case insensitive`, () => {
    expect.hasAssertions();

    expect(inferColumnType(["TRUE", "FALSE"])).toBe(ColumnType.Boolean);
  });

  test(`integer returns ${ColumnType.Number}`, () => {
    expect.hasAssertions();

    expect(inferColumnType(["0"])).toBe(ColumnType.Number);
  });

  test(`decimal returns ${ColumnType.Number}`, () => {
    expect.hasAssertions();

    expect(inferColumnType(["0.1"])).toBe(ColumnType.Number);
  });

  test(`negative returns ${ColumnType.Number}`, () => {
    expect.hasAssertions();

    expect(inferColumnType(["-1"])).toBe(ColumnType.Number);
  });

  test(`NaN returns ${ColumnType.String}`, () => {
    expect.hasAssertions();

    expect(inferColumnType([String(Number.NaN)])).toBe(ColumnType.String);
  });

  test(`epoch date returns ${ColumnType.Date}`, () => {
    expect.hasAssertions();

    expect(inferColumnType(["1970-01-01"])).toBe(ColumnType.Date);
  });

  test(`all date formats epoch date returns ${ColumnType.Date}`, () => {
    expect.hasAssertions();

    for (const format of DATE_FORMATS) {
      const epochDate = dayjs("1970-01-01", "YYYY-MM-DD", true).format(format);

      expect(inferColumnType([epochDate])).toBe(ColumnType.Date);
    }
  });

  test(`mixed ${ColumnType.Boolean} and ${ColumnType.Number} returns ${ColumnType.String}`, () => {
    expect.hasAssertions();

    expect(inferColumnType(["true", "0"])).toBe(ColumnType.String);
  });

  test(`mixed ${ColumnType.Number} and ${ColumnType.Date} returns ${ColumnType.String}`, () => {
    expect.hasAssertions();

    expect(inferColumnType(["0", "1970-01-01"])).toBe(ColumnType.String);
  });

  test(`mixed ${ColumnType.Boolean} and ${ColumnType.Date} returns ${ColumnType.String}`, () => {
    expect.hasAssertions();

    expect(inferColumnType(["true", "1970-01-01"])).toBe(ColumnType.String);
  });
});
