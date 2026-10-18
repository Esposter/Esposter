import { getColumnPitch } from "#src/placement/getColumnPitch";
import { describe, expect, test } from "vitest";

describe(getColumnPitch, () => {
  test("shares the width among the columns, each taking the gap after it", () => {
    expect.hasAssertions();

    expect(getColumnPitch(110, 2, { gap: 10, padding: 10 })).toBe(50);
  });
});
