import { getEndOfDay } from "#src/util/date/getEndOfDay";
import { describe, expect, test } from "vitest";

describe(getEndOfDay, () => {
  test("stretches to the last millisecond the day still holds", () => {
    expect.hasAssertions();

    expect(getEndOfDay(new Date(2026, 8, 1, 14, 3, 5))).toStrictEqual(new Date(2026, 8, 1, 23, 59, 59, 999));
  });
});
