import { getFrameScale } from "#src/services/getFrameScale";
import { describe, expect, test } from "vitest";

describe(getFrameScale, () => {
  const frameWidth = 992;

  test.each([
    { expected: 1, paneWidth: 0, title: "a pane width of 0 gives scale 1" },
    { expected: 600 / frameWidth, paneWidth: 600, title: "a narrow pane scales the frame down" },
    { expected: 1, paneWidth: 1200, title: "a wide pane does not scale the frame above 1" },
  ])("$title", ({ expected, paneWidth }) => {
    expect.hasAssertions();

    expect(getFrameScale(paneWidth, frameWidth)).toBe(expected);
  });
});
