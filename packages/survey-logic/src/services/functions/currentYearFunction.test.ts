import { TEST_BIRTHDATE, TEST_CONTEXT } from "#src/services/functions/constants.test";
import { currentYearFunction } from "#src/services/functions/currentYearFunction";
import { describe, expect, test } from "vitest";

describe(currentYearFunction, () => {
  test.each([
    ["the clock's year", [], 1970],
    ["an argument is ignored", [TEST_BIRTHDATE], 1970],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(currentYearFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});
