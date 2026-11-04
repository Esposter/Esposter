import { TEST_CONTEXT } from "#src/services/functions/constants.test";
import { dayFunction } from "#src/services/functions/dayFunction";
import { describe, expect, test } from "vitest";

describe(dayFunction, () => {
  test.each([
    ["the day of the month of a date", ["1970-01-11"], 11],
    ["the clock's day when no date is given", [], 2],
    ["the clock's day when the date is an empty string", [""], 2],
    ["an unreadable date is empty", ["x"], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(dayFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});
