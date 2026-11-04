import { TEST_CONTEXT, TEST_EPOCH_DATE, TEST_NEXT_YEAR_DATE } from "#src/services/functions/constants.test";
import { dateAddFunction } from "#src/services/functions/dateAddFunction";
import { describe, expect, test } from "vitest";

describe(dateAddFunction, () => {
  const epochMorning = `${TEST_EPOCH_DATE}T10:00`;

  test.each([
    ["days are added to a date", [TEST_EPOCH_DATE, 10], "1970-01-11"],
    ["months are added to a date", [TEST_EPOCH_DATE, 2, "months"], "1970-03-01"],
    ["years are added to a date", [TEST_EPOCH_DATE, 1, "years"], TEST_NEXT_YEAR_DATE],
    ["a month that runs out of days ends on its last day", ["1970-01-31", 1, "months"], "1970-02-28"],
    ["hours are added to a date and time", [epochMorning, 3, "hours"], "1970-01-01T13:00:00.000"],
    ["minutes are added to a date and time", [epochMorning, 90, "minutes"], "1970-01-01T11:30:00.000"],
    ["seconds are added to a date and time", [epochMorning, 30, "seconds"], "1970-01-01T10:00:30.000"],
    ["an empty interval adds days", [TEST_EPOCH_DATE, 1, ""], "1970-01-02"],
    ["an interval the language does not know has no result", [TEST_EPOCH_DATE, 1, "weeks"], undefined],
    ["a numeric string amount is read as its number, not joined onto the day", [TEST_EPOCH_DATE, "5"], "1970-01-06"],
    ["a zero amount is the date itself", [TEST_EPOCH_DATE, 0], "1970-01-01"],
    [
      "a zero amount reads a date and time as its canonical form",
      [`${TEST_EPOCH_DATE} 10:00`, 0],
      "1970-01-01T10:00:00.000",
    ],
    ["a fraction of a unit is cut to its whole units", [TEST_EPOCH_DATE, 1.9], "1970-01-02"],
    ["a day added across a daylight saving change is still the next day", ["1970-04-25", 2], "1970-04-27"],
    [
      "the time of day stays the same across a daylight saving change",
      ["1970-10-24T09:30", 1],
      "1970-10-25T09:30:00.000",
    ],
    ["a shift past the largest date has no result", [TEST_EPOCH_DATE, 1e12], undefined],
    ["the epoch given as the number zero is not a date", [0, 1, "hours"], undefined],
    ["an amount that reads as no number makes the date invalid, so it is empty", [TEST_EPOCH_DATE, "x"], undefined],
    ["an unreadable date is empty", ["x", 1], undefined],
    ["an empty date is empty", [undefined, 1], undefined],
    ["a missing amount is empty", [TEST_EPOCH_DATE], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(dateAddFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});
