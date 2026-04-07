// @vitest-environment node
import { BooleanFormat } from "#shared/models/tableEditor/file/column/BooleanFormat";
import { DateFormat } from "#shared/models/tableEditor/file/column/DateFormat";
import { NumberFormat } from "#shared/models/tableEditor/file/column/NumberFormat";
import { formatValue } from "@/services/tableEditor/file/column/formatValue";
import { describe, expect, test } from "vitest";

describe(formatValue, () => {
  test("returns empty string for null value", () => {
    expect.hasAssertions();
    expect(formatValue(null, BooleanFormat.TrueFalse)).toBe("");
    expect(formatValue(null, NumberFormat.Plain)).toBe("");
    expect(formatValue(null, DateFormat["YYYY-MM-DD"])).toBe("");
  });

  describe(BooleanFormat.TrueFalse, () => {
    test("formats boolean as true/false", () => {
      expect.hasAssertions();
      expect(formatValue(true, BooleanFormat.TrueFalse)).toBe("true");
      expect(formatValue(false, BooleanFormat.TrueFalse)).toBe("false");
    });
  });

  describe(BooleanFormat.YesNo, () => {
    test("formats boolean as Yes/No", () => {
      expect.hasAssertions();
      expect(formatValue(true, BooleanFormat.YesNo)).toBe("Yes");
      expect(formatValue(false, BooleanFormat.YesNo)).toBe("No");
    });
  });

  describe(BooleanFormat.OneZero, () => {
    test("formats boolean as 1/0", () => {
      expect.hasAssertions();
      expect(formatValue(true, BooleanFormat.OneZero)).toBe("1");
      expect(formatValue(false, BooleanFormat.OneZero)).toBe("0");
    });
  });

  describe(NumberFormat.Plain, () => {
    test("formats number as plain string", () => {
      expect.hasAssertions();
      expect(formatValue(0, NumberFormat.Plain)).toBe("0");
      expect(formatValue(0.1, NumberFormat.Plain)).toBe("0.1");
      expect(formatValue(-1, NumberFormat.Plain)).toBe("-1");
    });
  });

  describe(NumberFormat.Scientific, () => {
    test("formats number in scientific notation", () => {
      expect.hasAssertions();
      expect(formatValue(0, NumberFormat.Scientific)).toBe("0e+0");
    });
  });

  describe(DateFormat["YYYY-MM-DD"], () => {
    test("formats date string using dayjs", () => {
      expect.hasAssertions();
      expect(formatValue("1970-01-01", DateFormat["YYYY-MM-DD"])).toBe("1970-01-01");
    });
  });

  test("returns empty string for non-boolean value with boolean format", () => {
    expect.hasAssertions();
    expect(formatValue(0, BooleanFormat.TrueFalse)).toBe("");
  });

  test("returns empty string for non-number value with number format", () => {
    expect.hasAssertions();
    expect(formatValue("", NumberFormat.Plain)).toBe("");
  });
});
