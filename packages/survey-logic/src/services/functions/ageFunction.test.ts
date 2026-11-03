import { ageFunction } from "#src/services/functions/ageFunction";
import { TEST_BIRTHDATE, TEST_CONTEXT, TEST_LATER_BIRTHDATE } from "#src/services/functions/constants.test";
import { describe, expect, test } from "vitest";

describe(ageFunction, () => {
  test.each([
    ["a birthdate a whole number of years before the clock is that many years", [TEST_BIRTHDATE], 36],
    ["a birthday the clock has not reached yet leaves the age one year short", [TEST_LATER_BIRTHDATE], 35],
    ["a month interval counts the whole months since the birthdate", [TEST_BIRTHDATE, "months"], 432],
    ["a day interval reads zero, as SurveyJS does with no second date", [TEST_BIRTHDATE, "days"], 0],
    ["an empty birthdate is empty", [undefined], undefined],
    ["an unreadable birthdate reads as zero years, as SurveyJS does", ["x"], 0],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(ageFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});
