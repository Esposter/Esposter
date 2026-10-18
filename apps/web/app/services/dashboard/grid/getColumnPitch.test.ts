import { getColumnPitch } from "@/services/dashboard/grid/getColumnPitch";
import { describe, expect, test } from "vitest";

describe(getColumnPitch, () => {
  test("shares the width among the columns, each taking the margin after it", () => {
    expect.hasAssertions();

    expect(getColumnPitch(110, 2)).toBe(50);
  });
});
