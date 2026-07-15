import { BooleanFormat } from "#shared/models/resource/sheet/column/BooleanFormat";
import { DateFormat } from "#shared/models/resource/sheet/column/DateFormat";
import { NumberFormat } from "#shared/models/resource/sheet/column/NumberFormat";
import { formatValue } from "@/services/resource/sheet/column/formatValue";
import { describe, expect, test } from "vitest";

describe(formatValue, () => {
  test("returns empty string for null value", () => {
    expect.hasAssertions();
    expect(formatValue(null, BooleanFormat.TrueFalse)).toBe("");
    expect(formatValue(null, NumberFormat.Plain)).toBe("");
    expect(formatValue(null, DateFormat["YYYY-MM-DD"])).toBe("");
  });

  test(`formats boolean as ${BooleanFormat.TrueFalse}`, () => {
    expect.hasAssertions();
    expect(formatValue(true, BooleanFormat.TrueFalse)).toBe("true");
    expect(formatValue(false, BooleanFormat.TrueFalse)).toBe("false");
  });

  test(`formats boolean as ${BooleanFormat.YesNo}`, () => {
    expect.hasAssertions();
    expect(formatValue(true, BooleanFormat.YesNo)).toBe("Yes");
    expect(formatValue(false, BooleanFormat.YesNo)).toBe("No");
  });

  test(`formats boolean as ${BooleanFormat.OneZero}`, () => {
    expect.hasAssertions();
    expect(formatValue(true, BooleanFormat.OneZero)).toBe("1");
    expect(formatValue(false, BooleanFormat.OneZero)).toBe("0");
  });

  test(`formats number as ${NumberFormat.Plain}`, () => {
    expect.hasAssertions();
    expect(formatValue(0, NumberFormat.Plain)).toBe("0");
    expect(formatValue(0.1, NumberFormat.Plain)).toBe("0.1");
    expect(formatValue(-1, NumberFormat.Plain)).toBe("-1");
  });

  test(`formats number as ${NumberFormat.Scientific}`, () => {
    expect.hasAssertions();
    expect(formatValue(0, NumberFormat.Scientific)).toBe("0e+0");
  });

  test(`formats date string as ${DateFormat["YYYY-MM-DD"]}`, () => {
    expect.hasAssertions();
    expect(formatValue("1970-01-01", DateFormat["YYYY-MM-DD"])).toBe("1970-01-01");
  });

  test("returns raw string for invalid date string", () => {
    expect.hasAssertions();
    expect(formatValue("not-a-date", DateFormat["YYYY-MM-DD"])).toBe("not-a-date");
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
