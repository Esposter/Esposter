import {
  TEST_BIRTHDATE,
  TEST_CONTEXT,
  TEST_DAYLIGHT_GAP_DATE,
  TEST_EPOCH_DATE,
  TEST_YEAR_ONE_DATE,
  TEST_YEAR_ZERO_DATE,
  TEST_YEAR_ZERO_MARCH_DATE,
} from "#src/services/functions/constants.test";
import { dateDiffFunction } from "#src/services/functions/dateDiffFunction";
import { describe, expect, test } from "vitest";

describe(dateDiffFunction, () => {
  const epochEarlyMorning = `${TEST_EPOCH_DATE}T08:15`;
  const epochMorning = `${TEST_EPOCH_DATE}T10:00`;

  test.each([
    ["the days between two dates", [TEST_EPOCH_DATE, "1970-01-11"], 10],
    ["the days between two dates are the same in either order", ["1970-01-11", TEST_EPOCH_DATE], 10],
    ["an empty interval counts days", [TEST_EPOCH_DATE, "1970-01-11", ""], 10],
    ["the days across a daylight saving change are whole days", ["1970-04-25", "1970-04-27"], 2],
    ["the hours between two times round up to a whole hour", [epochEarlyMorning, epochMorning, "hours"], 2],
    ["the minutes between two times", [epochEarlyMorning, epochMorning, "minutes"], 105],
    [
      "the hours across a daylight saving change are the hours on the clock",
      ["1970-10-25T00:00", "1970-10-25T12:00", "hours"],
      12,
    ],
    ["a date-time end counts its time", [TEST_EPOCH_DATE, `${TEST_EPOCH_DATE}T05:00`, "hours"], 5],
    [
      "the hours across a daylight saving gap count the wall clock, which the gap does not shorten",
      [`${TEST_DAYLIGHT_GAP_DATE}T00:00`, `${TEST_DAYLIGHT_GAP_DATE}T04:00`, "hours"],
      4,
    ],
    [
      "two times with offsets that name one moment have no hours between them",
      [`${TEST_EPOCH_DATE}T10:30:00Z`, `${TEST_EPOCH_DATE}T12:30:00+02:00`, "hours"],
      0,
    ],
    [
      "the days from the first day of year zero to the first day of year one count its leap day",
      [TEST_YEAR_ZERO_DATE, TEST_YEAR_ONE_DATE],
      366,
    ],
    [
      "the days from the first of January to the first of March of year zero count its leap day",
      [TEST_YEAR_ZERO_DATE, TEST_YEAR_ZERO_MARCH_DATE],
      60,
    ],
    ["the months between two dates", [TEST_BIRTHDATE, TEST_EPOCH_DATE, "months"], 432],
    ["the months between two dates are the same in either order", [TEST_EPOCH_DATE, TEST_BIRTHDATE, "months"], 432],
    ["the years between two dates", [TEST_BIRTHDATE, TEST_EPOCH_DATE, "years"], 36],
    [
      "a month is not whole until the time of day the earlier date falls on",
      ["1970-01-01T10:00", "1970-02-01T09:00", "months"],
      0,
    ],
    ["a month is whole once the time of day is reached", ["1970-01-01T10:00", "1970-02-01T10:00", "months"], 1],
    ["an interval the language does not know has no result", [TEST_BIRTHDATE, TEST_EPOCH_DATE, "weeks"], undefined],
    ["a missing date is empty", [TEST_BIRTHDATE, undefined], undefined],
    ["a number is not a date", [0, 86_400_000], undefined],
    ["an unreadable date is empty", [TEST_BIRTHDATE, "x"], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(dateDiffFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});
