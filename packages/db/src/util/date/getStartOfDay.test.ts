import { getStartOfDay } from "#src/util/date/getStartOfDay";
import { describe, expect, test } from "vitest";

describe(getStartOfDay, () => {
  test("falls back to the first instant the day holds", () => {
    expect.hasAssertions();

    expect(getStartOfDay(new Date(1970, 0, 1, 1))).toStrictEqual(new Date(1970, 0, 1));
  });
});
