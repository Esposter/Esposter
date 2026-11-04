import { TEST_BIRTHDATE, TEST_CONTEXT } from "#src/services/functions/constants.test";
import { yearFunction } from "#src/services/functions/yearFunction";
import { describe, expect, test } from "vitest";

describe(yearFunction, () => {
  test.each([
    ["the year of a date", [TEST_BIRTHDATE], 1934],
    ["the clock's year when no date is given", [], 1970],
    ["the clock's year when the date is an empty string", [""], 1970],
    ["an unreadable date is empty", ["x"], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(yearFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});
