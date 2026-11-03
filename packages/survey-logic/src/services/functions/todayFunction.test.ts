import { TEST_CONTEXT } from "#src/services/functions/constants.test";
import { todayFunction } from "#src/services/functions/todayFunction";
import { describe, expect, test } from "vitest";

describe(todayFunction, () => {
  test.each([
    ["the clock's day at midnight", [], "1970-01-02"],
    ["a negative shift moves back a day", [-1], "1970-01-01"],
    ["a positive shift moves forward a day", [1], "1970-01-03"],
    ["a zero shift is the clock's day", [0], "1970-01-02"],
    ["an empty shift moves nothing", [undefined], "1970-01-02"],
    ["a numeric string shift is read as its number, not joined onto the day", ["1"], "1970-01-03"],
    ["an unreadable shift is empty", ["x"], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(todayFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});
