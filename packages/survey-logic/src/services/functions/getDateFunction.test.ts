import { TEST_CONTEXT } from "#src/services/functions/constants.test";
import { getDateFunction } from "#src/services/functions/getDateFunction";
import { describe, expect, test } from "vitest";

describe(getDateFunction, () => {
  test.each([
    ["a date is written back as a date", ["1970-01-11"], "1970-01-11"],
    ["a date and time keeps its time", ["1970-01-01T10:00"], "1970-01-01T10:00:00.000"],
    ["an empty date is empty", [undefined], undefined],
    ["an empty string is empty", [""], undefined],
    ["an unreadable date is empty", ["x"], undefined],
  ])("%s", (_title, args, expected) => {
    expect.hasAssertions();

    expect(getDateFunction(args, TEST_CONTEXT)).toStrictEqual(expected);
  });
});
