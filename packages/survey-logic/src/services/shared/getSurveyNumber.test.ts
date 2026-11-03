import { getSurveyNumber } from "#src/services/shared/getSurveyNumber";
import { describe, expect, test } from "vitest";

describe(getSurveyNumber, () => {
  test.each([
    ["reads a whole number text as its number", "12", 12],
    ["reads a comma as the decimal point", "1,5", 1.5],
    ["reads a number text with surrounding spaces", " 7 ", 7],
    ["reads a hexadecimal text", "0x1F", 31],
    ["reads a run of sixteen digits as not a number", "1234567890123456", Number.NaN],
    ["reads a text with letters in it as not a number", "12abc", Number.NaN],
    ["reads an empty text as not a number", "", Number.NaN],
    ["reads a boolean as not a number", true, Number.NaN],
    ["reads a number as itself", 2.5, 2.5],
  ])("%s", (_title, value, expected) => {
    expect.hasAssertions();

    expect(getSurveyNumber(value)).toStrictEqual(expected);
  });
});
