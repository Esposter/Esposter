import { ageFunction } from "#src/services/functions/ageFunction";
import {
  TEST_BIRTHDATE,
  TEST_CONTEXT,
  TEST_LATER_BIRTHDATE,
  TEST_NEXT_YEAR_DATE,
} from "#src/services/functions/constants.test";
import { describe, expect, test } from "vitest";

describe(ageFunction, () => {
  test.each([
    ["a birthdate a whole number of years before the clock is that many years", [TEST_BIRTHDATE], 36],
    ["a birthday the clock has not reached yet leaves the age one year short", [TEST_LATER_BIRTHDATE], 35],
    ["a month interval counts the whole months since the birthdate", [TEST_BIRTHDATE, "months"], 432],
    ["a day interval counts the days since the birthdate", [TEST_BIRTHDATE, "days"], 13_150],
    ["a birthdate after the clock has no age", [TEST_NEXT_YEAR_DATE], undefined],
    ["an interval the language does not know has no age", [TEST_BIRTHDATE, "weeks"], undefined],
    ["an empty birthdate is empty", [undefined], undefined],
    ["a number is not a birthdate", [0], undefined],
    ["an unreadable birthdate is empty", ["x"], undefined],
    ["an unreadable birthdate is empty for a day interval too", ["x", "days"], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(ageFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});
