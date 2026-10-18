import { getTimeSkippedDays } from "#src/services/menu/getTimeSkippedDays";
import { describe, expect, test } from "vitest";

describe(getTimeSkippedDays, () => {
  test("a skip counts the days it passes", () => {
    expect.hasAssertions();

    expect(getTimeSkippedDays(1380, 120)).toBe(1);
  });

  test("a skip within the day counts none", () => {
    expect.hasAssertions();

    expect(getTimeSkippedDays(600, 10)).toBe(0);
  });

  test("an advance beyond two days counts only two", () => {
    expect.hasAssertions();

    expect(getTimeSkippedDays(1380, 3000)).toBe(2);
  });
});
