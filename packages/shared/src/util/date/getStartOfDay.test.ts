import { getStartOfDay } from "#src/util/date/getStartOfDay";
import { describe, expect, test } from "vitest";

describe(getStartOfDay, () => {
  test("falls back to the first instant the day holds", () => {
    expect.hasAssertions();

    expect(getStartOfDay(new Date(2026, 8, 1, 14, 3, 5))).toStrictEqual(new Date(2026, 8, 1));
  });
});
