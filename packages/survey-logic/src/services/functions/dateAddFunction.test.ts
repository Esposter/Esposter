import { TEST_CONTEXT, TEST_EPOCH_DATE, TEST_NEXT_YEAR_DATE } from "#src/services/functions/constants.test";
import { dateAddFunction } from "#src/services/functions/dateAddFunction";
import { describe, expect, test } from "vitest";

describe(dateAddFunction, () => {
  const epochMorning = `${TEST_EPOCH_DATE}T10:00`;

  test.each([
    ["days are added to a date", [TEST_EPOCH_DATE, 10], "1970-01-11"],
    ["months are added to a date", [TEST_EPOCH_DATE, 2, "months"], "1970-03-01"],
    ["years are added to a date", [TEST_EPOCH_DATE, 1, "years"], TEST_NEXT_YEAR_DATE],
    ["hours are added to a date and time", [epochMorning, 3, "hours"], "1970-01-01T13:00:00.000"],
    ["minutes are added to a date and time", [epochMorning, 90, "minutes"], "1970-01-01T11:30:00.000"],
    ["seconds are added to a date and time", [epochMorning, 30, "seconds"], "1970-01-01T10:00:30.000"],
    ["an empty interval adds days", [TEST_EPOCH_DATE, 1, ""], "1970-01-02"],
    ["an interval SurveyJS does not know leaves the date as it is", [TEST_EPOCH_DATE, 1, "weeks"], "1970-01-01"],
    ["a numeric string amount is read as its number, not joined onto the day", [TEST_EPOCH_DATE, "5"], "1970-01-06"],
    ["a zero amount is empty, as SurveyJS reads it", [TEST_EPOCH_DATE, 0], undefined],
    ["the epoch given as the number zero is a date, not an empty one", [0, 1], "1970-01-02"],
    ["an amount that reads as no number makes the date invalid, so it is empty", [TEST_EPOCH_DATE, "x"], undefined],
    ["an unreadable date is empty", ["x", 1], undefined],
    ["an empty date is empty", [undefined, 1], undefined],
    ["a missing amount is empty", [TEST_EPOCH_DATE], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(dateAddFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});
