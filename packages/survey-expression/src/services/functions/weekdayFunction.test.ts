import { TEST_CONTEXT, TEST_EPOCH_DATE } from "#src/services/functions/constants.test";
import { weekdayFunction } from "#src/services/functions/weekdayFunction";
import { describe, expect, test } from "vitest";

describe(weekdayFunction, () => {
  test.each([
    ["the day of the week of a date, from zero for Sunday", [TEST_EPOCH_DATE], 4],
    ["the clock's weekday when no date is given", [], 5],
    ["an unreadable date is empty", ["x"], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(weekdayFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});
