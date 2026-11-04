import { TEST_CONTEXT } from "#src/services/functions/constants.test";
import { monthFunction } from "#src/services/functions/monthFunction";
import { describe, expect, test } from "vitest";

describe(monthFunction, () => {
  test.each([
    ["the month of a date, from one for January", ["1970-03-05"], 3],
    ["the clock's month when no date is given", [], 1],
    ["the clock's month when the date is an empty string", [""], 1],
    ["an unreadable date is empty", ["x"], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(monthFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});
