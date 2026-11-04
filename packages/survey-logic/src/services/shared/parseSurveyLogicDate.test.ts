import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { TEST_DAYLIGHT_GAP_DATE } from "#src/services/functions/constants.test";
import { parseSurveyLogicDate } from "#src/services/shared/parseSurveyLogicDate";
import { describe, expect, test } from "vitest";

// The parser reads a date by its shape, so the date is the epoch's own year, and only the part under test moves from it.
// A date with no zone is read as its wall clock, so each expected value is that clock written in UTC
describe(parseSurveyLogicDate, () => {
  test.each<[string, SurveyLogicValue, string | undefined]>([
    ["a date-only string is read as its wall clock at midnight", "1970-01-02", "1970-01-02T00:00:00.000Z"],
    ["a date and a time joined by a T is read as its wall clock", "1970-01-02T10:30", "1970-01-02T10:30:00.000Z"],
    ["a date and a time joined by a space is read as its wall clock", "1970-01-02 10:30", "1970-01-02T10:30:00.000Z"],
    [
      "seconds and a fraction of a second are read when they are given",
      "1970-01-02T10:30:15.250",
      "1970-01-02T10:30:15.250Z",
    ],
    [
      "a time in a daylight saving gap is read as written, not moved out of the gap",
      `${TEST_DAYLIGHT_GAP_DATE}T02:30`,
      `${TEST_DAYLIGHT_GAP_DATE}T02:30:00.000Z`,
    ],
    ["a number is not a date", 0, undefined],
    ["an empty text is not a date", "", undefined],
    ["a day the month does not have is not a date", "1970-02-30", undefined],
    ["an hour past the twenty-fourth is not a date", "1970-01-02T24:00", undefined],
    ["a word after the date is not a date", "1970-01-02x", undefined],
    ["a leading space is not a date, as no text is trimmed", " 1970-01-02", undefined],
    ["an unanswered value is not a date", undefined, undefined],
  ])("%s", (_title, value, expected) => {
    expect.hasAssertions();

    expect(parseSurveyLogicDate(value)?.toISOString()).toStrictEqual(expected);
  });
});
