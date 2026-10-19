import { getFrameWidth } from "#src/services/getFrameWidth";
import { describe, expect, test } from "vitest";

describe(getFrameWidth, () => {
  test("fill returns the pane width when the pane is wider than the least width", () => {
    expect.hasAssertions();
    expect(getFrameWidth(992, true, 1200)).toBe(1200);
  });

  test("fill returns the least width when the pane is narrower", () => {
    expect.hasAssertions();
    expect(getFrameWidth(992, true, 600)).toBe(992);
  });

  test("a fixed width ignores the pane", () => {
    expect.hasAssertions();
    expect(getFrameWidth(768, false, 1024)).toBe(768);
    expect(getFrameWidth(768, false, 300)).toBe(768);
  });
});
