import { TEST_BIRTHDATE, TEST_CONTEXT, TEST_EPOCH_DATE } from "#src/services/functions/constants.test";
import { dateDiffFunction } from "#src/services/functions/dateDiffFunction";
import { describe, expect, test } from "vitest";

describe(dateDiffFunction, () => {
  const epochEarlyMorning = `${TEST_EPOCH_DATE}T08:15`;
  const epochMorning = `${TEST_EPOCH_DATE}T10:00`;

  test.each([
    ["the days between two dates", [TEST_EPOCH_DATE, "1970-01-11"], 10],
    ["the days between two dates are the same in either order", ["1970-01-11", TEST_EPOCH_DATE], 10],
    ["an empty interval counts days", [TEST_EPOCH_DATE, "1970-01-11", ""], 10],
    ["the hours between two times round up to a whole hour", [epochEarlyMorning, epochMorning, "hours"], 2],
    ["the minutes between two times", [epochEarlyMorning, epochMorning, "minutes"], 105],
    ["the months between two dates", [TEST_BIRTHDATE, TEST_EPOCH_DATE, "months"], 432],
    ["the years between two dates", [TEST_BIRTHDATE, TEST_EPOCH_DATE, "years"], 36],
    ["an interval SurveyJS does not know counts years", [TEST_BIRTHDATE, TEST_EPOCH_DATE, "weeks"], 36],
    ["a missing date is empty", [TEST_BIRTHDATE, undefined], undefined],
    ["the epoch given as the number zero is a date, not a missing one", [0, 86_400_000], 1],
    ["an unreadable date is NaN", [TEST_BIRTHDATE, "x"], Number.NaN],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(dateDiffFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});
