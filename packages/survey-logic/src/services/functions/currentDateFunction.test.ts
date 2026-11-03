import { TEST_BIRTHDATE, TEST_CONTEXT } from "#src/services/functions/constants.test";
import { currentDateFunction } from "#src/services/functions/currentDateFunction";
import { describe, expect, test } from "vitest";

describe(currentDateFunction, () => {
  test.each([
    ["the clock's moment as a date and time", [], "1970-01-02T13:00:00.000"],
    ["an argument is ignored", [TEST_BIRTHDATE], "1970-01-02T13:00:00.000"],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(currentDateFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});
