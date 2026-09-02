import { checkIsSameDay } from "#src/util/date/checkIsSameDay";
import { describe, expect, test } from "vitest";

describe(checkIsSameDay, () => {
  test("reads two instants hours apart on one day as the same day", () => {
    expect.hasAssertions();

    expect(checkIsSameDay(new Date(2026, 8, 1), new Date(2026, 8, 1, 23, 59, 59, 999))).toBe(true);
  });

  test("reads two instants a millisecond apart across midnight as different days", () => {
    expect.hasAssertions();

    expect(checkIsSameDay(new Date(2026, 8, 1, 23, 59, 59, 999), new Date(2026, 8, 2))).toBe(false);
  });
});
