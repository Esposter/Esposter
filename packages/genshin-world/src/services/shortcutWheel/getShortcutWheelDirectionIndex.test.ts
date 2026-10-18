import { ShortcutWheelDirectionCount } from "#src/models/shortcutWheel/ShortcutWheelDirectionCount";
import { getShortcutWheelDirectionIndex } from "#src/services/shortcutWheel/getShortcutWheelDirectionIndex";
import { describe, expect, test } from "vitest";

describe("getShortcutWheelDirectionIndex", () => {
  test("a pointer pushed to the right picks the entry to its right", () => {
    expect.hasAssertions();
    expect(getShortcutWheelDirectionIndex(1, 0, ShortcutWheelDirectionCount.Eight)).toBe(2);
  });

  test("a pointer at the centre picks no entry", () => {
    expect.hasAssertions();
    expect(getShortcutWheelDirectionIndex(0, 0, ShortcutWheelDirectionCount.Eight)).toBeUndefined();
  });
});
