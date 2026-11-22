import { getFrameWidth } from "#src/services/getFrameWidth";
import { describe, expect, test } from "vitest";

describe(getFrameWidth, () => {
  const leastWidth = 992;

  test.each([
    {
      expected: 1200,
      paneWidth: 1200,
      title: "fill returns the pane width when the pane is wider than the least width",
    },
    { expected: leastWidth, paneWidth: 600, title: "fill returns the least width when the pane is narrower" },
  ])("$title", ({ expected, paneWidth }) => {
    expect.hasAssertions();

    expect(getFrameWidth(leastWidth, true, paneWidth)).toBe(expected);
  });

  test("a fixed width ignores the pane", () => {
    expect.hasAssertions();
    expect(getFrameWidth(768, false, 1024)).toBe(768);
    expect(getFrameWidth(768, false, 300)).toBe(768);
  });
});
