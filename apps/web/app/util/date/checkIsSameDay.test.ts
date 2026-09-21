import { checkIsSameDay } from "@/util/date/checkIsSameDay";
import { describe, expect, test } from "vitest";

describe(checkIsSameDay, () => {
  // Local parts, since the day is read in the local zone: the epoch's first day, its last millisecond and the
  // First millisecond of the day after
  const epochDay = new Date(1970, 0, 1);
  const epochDayEnd = new Date(1970, 0, 1, 23, 59, 59, 999);
  const nextDay = new Date(1970, 0, 2);

  test("reads two instants hours apart on one day as the same day", () => {
    expect.hasAssertions();

    expect(checkIsSameDay(epochDay, epochDayEnd)).toBe(true);
  });

  test("reads two instants a millisecond apart across midnight as different days", () => {
    expect.hasAssertions();

    expect(checkIsSameDay(epochDayEnd, nextDay)).toBe(false);
  });
});
