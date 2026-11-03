import { TEST_CONTEXT, TEST_EPOCH_DATE } from "#src/services/functions/constants.test";
import { diffDaysFunction } from "#src/services/functions/diffDaysFunction";
import { describe, expect, test } from "vitest";

describe(diffDaysFunction, () => {
  test.each([
    ["the calendar days between two dates", [TEST_EPOCH_DATE, "1970-01-11"], 10],
    ["the calendar days are the same in either order", ["1970-01-11", TEST_EPOCH_DATE], 10],
    ["the calendar days ignore the time of day", ["1970-01-01T23:00", "1970-01-02T01:00"], 1],
    ["a missing second date counts zero days", [TEST_EPOCH_DATE], 0],
    [
      "the epoch given as the number zero is a date, so a date beside it is unreadable rather than missing",
      [0, "x"],
      Number.NaN,
    ],
    ["an empty second date counts zero days", [TEST_EPOCH_DATE, undefined], 0],
    ["an unreadable date is NaN", [TEST_EPOCH_DATE, "x"], Number.NaN],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(diffDaysFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});
