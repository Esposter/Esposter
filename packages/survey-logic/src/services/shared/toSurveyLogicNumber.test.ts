import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { toSurveyLogicNumber } from "#src/services/shared/toSurveyLogicNumber";
import { describe, expect, test } from "vitest";

describe(toSurveyLogicNumber, () => {
  test.each<[string, string, number | undefined]>([
    ["reads a plain decimal text as its number", "5", 5],
    ["reads a text with spaces around its digits as the number they make", " 5 ", 5],
    ["reads a minus sign as a negative number", "-5", -5],
    ["reads a plus sign as the number without it", "+5", 5],
    ["reads a point with digits after it as a decimal", ".5", 0.5],
    ["reads a point with no digits after it as the whole number", "5.", 5],
    ["reads an exponent as a power of ten", "5e2", 500],
    ["reads hexadecimal text as no number", "0x1F", undefined],
    ["reads binary text as no number", "0b1", undefined],
    ["reads a comma decimal as no number", "1,5", undefined],
    ["reads a thousands separator as no number", "1,000", undefined],
    ["reads empty text as no number", "", undefined],
    ["reads words as no number", "abc", undefined],
    ["reads leading zeros as the number without them", "007", 7],
    [
      "reads a 17-digit text as the nearest double to it, with no length limit",
      "12345678901234567",
      Number("12345678901234567"),
    ],
  ])("%s", (_title, value, expected) => {
    expect.hasAssertions();

    expect(toSurveyLogicNumber(value)).toStrictEqual(expected);
  });

  test.each<[string, SurveyLogicValue, number | undefined]>([
    ["reads a finite number as itself", 5, 5],
    ["reads NaN as no number", Number.NaN, undefined],
    ["reads an infinite number as no number", Number.POSITIVE_INFINITY, undefined],
    ["reads a boolean as no number", true, undefined],
    ["reads a list as no number", [5], undefined],
  ])("%s", (_title, value, expected) => {
    expect.hasAssertions();

    expect(toSurveyLogicNumber(value)).toStrictEqual(expected);
  });
});
