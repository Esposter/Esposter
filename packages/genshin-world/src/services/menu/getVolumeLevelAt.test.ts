import { getVolumeLevelAt } from "#src/services/menu/getVolumeLevelAt";
import { describe, expect, test } from "vitest";

describe(getVolumeLevelAt, () => {
  test("a volume beyond the row's range stops at its limit", () => {
    expect.hasAssertions();

    expect(getVolumeLevelAt(1.4)).toBe(10);
    expect(getVolumeLevelAt(-0.2)).toBe(1);
  });
});
