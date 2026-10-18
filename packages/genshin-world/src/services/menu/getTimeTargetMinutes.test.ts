import { getTimeTargetMinutes } from "#src/services/menu/getTimeTargetMinutes";
import { describe, expect, test } from "vitest";

describe(getTimeTargetMinutes, () => {
  test("an advance under thirty minutes lands thirty minutes on", () => {
    expect.hasAssertions();

    expect(getTimeTargetMinutes(600, 10)).toBe(630);
  });

  test("an advance beyond two days stops at two days", () => {
    expect.hasAssertions();

    expect(getTimeTargetMinutes(600, 3000)).toBe(600);
  });

  test("an advance past midnight wraps onto the next day's hours", () => {
    expect.hasAssertions();

    expect(getTimeTargetMinutes(1380, 120)).toBe(60);
  });
});
