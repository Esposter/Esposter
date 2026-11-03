import { TEST_BIRTHDATE, TEST_CONTEXT } from "#src/services/functions/constants.test";
import { getYearFunction } from "#src/services/functions/getYearFunction";
import { describe, expect, test } from "vitest";

describe(getYearFunction, () => {
  test.each([
    ["the year of a date", [TEST_BIRTHDATE], 1934],
    ["no argument is empty", [], undefined],
    ["an empty argument is empty", [undefined], undefined],
    ["an unreadable date is NaN", ["x"], Number.NaN],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(getYearFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});
